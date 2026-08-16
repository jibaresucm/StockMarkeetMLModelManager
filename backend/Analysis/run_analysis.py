import sys
import os
import json
from datetime import datetime
from settings import settings
import redis
import requests
import time
from db_connection import get_connection

REDIS_HOST = settings.REDIS_HOST
REDIS_PORT = settings.REDIS_PORT
REDIS_DB = 0

KEY_PENDING = "news:pending"   # cola de donde se leen las noticias
KEY_FAILED = "news:failed"     # noticias que fallaron

OLLAMA_URL = f"http://{settings.OLLAMA_HOST}:{settings.OLLAMA_PORT}/api/chat"
OLLAMA_MODEL = settings.OLLAMA_MODEL
TEMPERATURE = 0.0
LLM_TIMEOUT = 120

session = requests.Session()

#Init the db
conn = get_connection()
cursor = conn.cursor()
cursor.execute("""CREATE TABLE IF NOT EXISTS news_analysis (
    news_id INT NOT NULL,
    title VARCHAR(500),
    date DATETIME,
    sentiment FLOAT,
    market_impact FLOAT,
    PRIMARY KEY (news_id)
)""")
conn.commit()
cursor.close()
conn.close()
# Scores que devuelve el LLM, el prompt y el json que se le exige se generan de aquí.
# Si se añade un score nuevo hay que añadir tambien su columna en news_analysis
# y ponerlo en la query de save_analysis.
SCORE_FIELDS = {
    "sentiment": {
        "description": "Emotional and factual tone of the headline text. -1.0 is deeply negative/critical, 0.0 is strictly neutral, 1.0 is highly enthusiastic/positive.",
        "min": -1.0, "max": 1.0
    },
    "market_impact": {
        "description": "Financial consequence for tech equities (Big Tech). -1.0 means severe bearish pressure (regulatory bans, lawsuits, missed earnings), 0.0 means negligible/noise, 1.0 means massive bullish driver (major breakthroughs, massive market expansion).",
        "min": -1.0, "max": 1.0
    },
}

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)
def get_redis():
    return r


def get_mysql():

    conn = get_connection()

    return conn


# La noticia debe traer el id de su fila en MySQL y el titulo, la fecha es opcional
def parse_item(raw):
    try:
        item = json.loads(raw)
    except:
        return None

    if not isinstance(item, dict) or item.get("id") is None or not item.get("title"):
        return None

    if not item.get("date"):
        item["date"] = datetime.now().isoformat()

    return item


# El json que se le exige al modelo, sacado de SCORE_FIELDS
def build_schema():
    props = {
        "reasoning": {
            "type": "string",
            "description": "Analysis of action vs entity, veracity of the headlines, scale, relevance to the market, macro effect, and sentiment direction."
        }}
    for field, cfg in SCORE_FIELDS.items():
        props[field] = {"type": "number", "minimum": cfg["min"], "maximum": cfg["max"]}

    return {"type": "object", "properties": props, "required": ['reasoning'] + list(SCORE_FIELDS.keys())}


def build_prompt(title, date):
    fields = ""
    for field, cfg in SCORE_FIELDS.items():
        fields += f'- "{field}": {cfg["description"]}\n'

    return (
        "You are a quantitative financial NLP engine evaluating news impact on big tech equities.\n"
        "Analyze the headline and assign floating-point scores based strictly on this calibration scale:\n\n"
        "MARKET IMPACT SCALE:\n"
        "- +0.8 to +1.0: Systemic bullish drivers (Fed rate cuts, trillion-dollar market shifts, historic mega-earnings).\n"
        "- +0.4 to +0.7: Major positive catalysts (Breakthrough product launches, massive user/revenue jumps in Big Tech).\n"
        "- +0.1 to +0.3: Minor positive news (Standard startup funding rounds, routine tech partnerships).\n"
        "-  0.0        : Pure noise or irrelevant news (Opinion pieces, minor blog posts, tutorials, rumors, isolated moves(only affects a single stock)).\n"
        "- -0.1 to -0.3: Minor headwinds (Small localized security bugs, minor regulatory warnings).\n"
        "- -0.4 to -0.7: Strong negative events (Antitrust lawsuits, regional regulatory bans, data leaks).\n"
        "- -0.8 to -1.0: Systemic crash events (Severe government penalties, major financial fraud/collapses).\n\n"
        
        "When market impact is positive it means that in the near future the ALL of big tech stock prices will go up\n"
        "When market impact is negative it means that the headline will cause ALL of big tech stocks to go down in the near future\n"
        "For a impact to be of great importance the effects on the market needs to be widespread, affecting all other companies of the sector, not only the one that the headline mentions\n"
        "Big shifts in progress or public opinion regarding a global theme is what is needed for the market impact ot be of great importance.\n"
        "Day to day news like isolated attacks, minor decisions, features launches or things that don't affect the current paradigm won't move the market\n"
        "Expected product launches or minor improvements won¡t move the market\n"
        "Expectations do not move the market, only facts. opportunities are nothing if results do not convert. Do not hallucinate untangible expectations.\n"
        "CEO or personal changes only affect the individual company, not the whole market.\n"
        "Aquisitions do not affect the whole market, only isolated companies\n"
        "The market does not respond to individual changes, for changes to affect the market they need to shift the entire paradigm. \n\n"
        
       "SENTIMENT SCALE (-1.0 to 1.0):\n"
        "- +0.8 to +1.0: Highly enthusiastic, historic records, breakthrough praises.\n"
        "- +0.4 to +0.7: Positive, solid growth, successful product launches, user gains.\n"
        "- +0.1 to +0.3: Mildly positive, routine investments or constructive reports.\n"
        "-  0.0        : Strictly neutral, purely factual statements, neutral announcements.\n"
        "- -0.1 to -0.3: Mildly negative, minor operational bugs, light warnings.\n"
        "- -0.4 to -0.7: Negative, severe data leaks, lawsuits, regulatory probes, heavy criticisms.\n"
        "- -0.8 to -1.0: Deeply catastrophic, massive fraud, total system collapses, severe criminal penalties.\n\n"
        
        "OTHER RULES: \n\n:"
        "REGULATORY & EXECUTIVE ORDERS RULE: \n" 
        "  - Repeals of restrictive regulations, regulatory delays, or executive orders lifting bans (e.g., TikTok extensions, AI deregulation) MUST yield positive or neutral market impact (>= 0.0), as they reduce compliance friction for tech companies.\n"
        "  - Routine software product updates, feature additions, or minor app changes must stay at 0.0 sentiment and 0.0 market impact (they are everyday noise).\n"
        "CAPITAL PROPORTIONALITY (CAPEX/DEALS):\n"
        "   - Evaluate financial scale strictly by numbers: Sub-$100M events can be minor; $100M to $1B events must scale impact to at least +0.2/-0.2; multi-billion dollar ($1B+) investments, loans, or mega-infrastructure projects must scale impact to +0.4 to +0.6.\n"
        "SYSTEMIC RISK & RADIUS:\n"
        "   - Security breaches, ransomware, or outages affecting single local users are neutral/noise (0.0). Those affecting multi-corporation supply chains, critical infrastructure, or mass ecosystems are systemic and MUST yield negative impact (<= -0.2).\n"
        "PLATINUM PRODUCT LIFECYCLE VS. MINOR PATCHES:\n"
        "   - Routine software updates, feature tweaks, or app modifications are pure noise (sentiment: 0.0, impact: 0.0). Completely new flagship hardware platforms or foundational architectural shifts by major players are major market drivers (sentiment >= +0.5, impact >= +0.3).\n"
  
        f"Respond with a JSON object with these fields:\n{fields}\n"
        "\n\n\n"
        f"Headline: {title}\n\n")


def analyze_news(title, date):
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [{"role": "user", "content": build_prompt(title, date)}],
        "stream": False,
        "format": build_schema(),
        "options": {"temperature": TEMPERATURE}
    }

    try:
        response = session.post(OLLAMA_URL, json=payload, timeout=LLM_TIMEOUT)
    except requests.exceptions.ConnectionError:
        print(f"No se puede conectar a Ollama (instalar de https://ollama.com y hacer: ollama pull {OLLAMA_MODEL})")
        sys.exit(1)

    response.raise_for_status()
    scores = json.loads(response.json()["message"]["content"])

    # se recorta cada score a su rango por si el modelo se pasa
    clean = {}
    for field, cfg in SCORE_FIELDS.items():
        clean[field] = max(cfg["min"], min(cfg["max"], float(scores[field])))

    return clean


# Guarda el análisis en MySQL, si ya existía para ese id y lo actualiza
def save_analysis(conn, item, scores):
    query = ("INSERT INTO news_analysis (news_id, title, date, sentiment, market_impact) "
             "VALUES (%s, %s, %s, %s, %s) "
             "ON DUPLICATE KEY UPDATE sentiment = VALUES(sentiment), "
             "market_impact = VALUES(market_impact)")

    date = item["date"].replace("T", " ")[:19]

    cursor = conn.cursor()
    cursor.execute(query, (item["id"], item["title"], date,
                           scores["sentiment"], scores["market_impact"]))
    conn.commit()
    cursor.close()


def process_item(r, conn, raw):
    item = parse_item(raw)
    print(raw)

    if not item:
        print("FALLO noticia sin id o sin titulo, va a news:failed")
        r.lpush(KEY_FAILED, raw)
        return

    try:
        scores = analyze_news(item["title"], item["date"])
        save_analysis(conn, item, scores)
        print(f"OK    id={item['id']:<6} {item['title'][:55]:<55}  " +
              "  ".join(f"{f}={v:+.2f}" for f, v in scores.items()))

    except SystemExit:
        r.rpush(KEY_PENDING, raw)  # Ollama caído, se devuelve a la cola
        raise

    except Exception as e:
        print(f"FALLO {item['title'][:55]}: {e}")
        r.lpush(KEY_FAILED, raw)


def run_analysis(watch=False):
    r = get_redis()
    conn = get_mysql()

    print(f"Analizando noticias...")
    print(f"Noticias en cola: {r.llen(KEY_PENDING)}\n")

    processed = 0

    try:
        while True:
            raw = None
            if watch:
                try:
                    raw = r.blpop(KEY_PENDING, timeout=0)[1]  # espera hasta que llegue algo
                except TimeoutError as t:
                    print("Timeout, intentando otra vez...")
                except:
                    print("Algo ha salido mal")
                    
            else:
                raw = r.lpop(KEY_PENDING)
                if raw is None:
                    break

            process_item(r, conn, raw)
            processed += 1
            
            print("Waiting...")
            time.sleep(4)
            print("Waited")
            
    except KeyboardInterrupt:
        print("\nParado por el usuario")

    conn.close()
    print(f"\nListo, {processed} noticias analizadas")

    if r.llen(KEY_FAILED):
        print(f"Hay {r.llen(KEY_FAILED)} noticias fallidas en {KEY_FAILED}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python run_analysis.py [--watch]")
        sys.exit(1)

    run_analysis(watch="--watch" in sys.argv)
