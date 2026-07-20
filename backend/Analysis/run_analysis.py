
import sys
import os
import json
from datetime import datetime

import redis
import requests

# para reutilizar la conexión MySQL del scraper
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "Scraping"))
from db_connection import get_connection

REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 0

KEY_PENDING = "news:pending"   # cola de donde se leen las noticias
KEY_FAILED = "news:failed"     # noticias que fallaron

OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "llama3.2"
TEMPERATURE = 0.0
LLM_TIMEOUT = 120

# Scores que devuelve el LLM, el prompt y el json que se le exige se generan de aquí.
# Si se añade un score nuevo hay que añadir tambien su columna en news_analysis
# y ponerlo en la query de save_analysis.
SCORE_FIELDS = {
    "sentiment": {
        "description": "Overall tone of the news itself, from -1.0 (very negative) to 1.0 (very positive)",
        "min": -1.0, "max": 1.0
    },
    "relevance": {
        "description": "How related the news is to the company, from 0.0 (unrelated) to 1.0 (directly about the company)",
        "min": 0.0, "max": 1.0
    },
    "impact": {
        "description": "Expected short-term effect on the stock price, from -1.0 (very bearish) to 1.0 (very bullish)",
        "min": -1.0, "max": 1.0
    },
}


def get_redis():
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)

    try:
        r.ping()
    except:
        print("No se puede conectar a Redis (docker run -d --name redis -p 6379:6379 redis)")
        sys.exit(1)

    return r


def get_mysql():
    try:
        conn = get_connection()
    except Exception as e:
        print("No se puede conectar a MySQL:", e)
        sys.exit(1)

    # crea la tabla de resultados si no existe
    cursor = conn.cursor()
    cursor.execute("""CREATE TABLE IF NOT EXISTS news_analysis (
        news_id INT NOT NULL,
        ticker VARCHAR(10) NOT NULL,
        title VARCHAR(500),
        date DATETIME,
        sentiment FLOAT,
        relevance FLOAT,
        impact FLOAT,
        PRIMARY KEY (news_id, ticker)
    )""")
    conn.commit()
    cursor.close()

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
    props = {}
    for field, cfg in SCORE_FIELDS.items():
        props[field] = {"type": "number", "minimum": cfg["min"], "maximum": cfg["max"]}

    return {"type": "object", "properties": props, "required": list(SCORE_FIELDS.keys())}


def build_prompt(ticker, title, date):
    fields = ""
    for field, cfg in SCORE_FIELDS.items():
        fields += f'- "{field}": {cfg["description"]}\n'

    return (f"You are a financial analyst. Score this news headline for the company with stock ticker {ticker}.\n\n"
            f"Date: {date}\nHeadline: {title}\n\n"
            f"Respond ONLY with a JSON object with these numeric fields:\n{fields}\n"
            "If the news has nothing to do with the company or its sector, relevance and impact style fields must be close to 0.")


def analyze_news(ticker, title, date):
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [{"role": "user", "content": build_prompt(ticker, title, date)}],
        "stream": False,
        "format": build_schema(),
        "options": {"temperature": TEMPERATURE}
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=LLM_TIMEOUT)
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


# Guarda el análisis en MySQL, si ya existía para ese id y ticker lo actualiza
def save_analysis(conn, ticker, item, scores):
    query = ("INSERT INTO news_analysis (news_id, ticker, title, date, sentiment, relevance, impact) "
             "VALUES (%s, %s, %s, %s, %s, %s, %s) "
             "ON DUPLICATE KEY UPDATE sentiment = VALUES(sentiment), "
             "relevance = VALUES(relevance), impact = VALUES(impact)")

    date = item["date"].replace("T", " ")[:19]

    cursor = conn.cursor()
    cursor.execute(query, (item["id"], ticker, item["title"], date,
                           scores["sentiment"], scores["relevance"], scores["impact"]))
    conn.commit()
    cursor.close()


def process_item(r, conn, ticker, raw):
    item = parse_item(raw)

    if not item:
        print("FALLO noticia sin id o sin titulo, va a news:failed")
        r.lpush(KEY_FAILED, raw)
        return

    try:
        scores = analyze_news(ticker, item["title"], item["date"])
        save_analysis(conn, ticker, item, scores)
        print(f"OK    id={item['id']:<6} {item['title'][:55]:<55}  " +
              "  ".join(f"{f}={v:+.2f}" for f, v in scores.items()))

    except SystemExit:
        r.rpush(KEY_PENDING, raw)  # Ollama caído, se devuelve a la cola
        raise

    except Exception as e:
        print(f"FALLO {item['title'][:55]}: {e}")
        r.lpush(KEY_FAILED, raw)


def run_analysis(ticker, watch=False):
    r = get_redis()
    conn = get_mysql()

    print(f"Analizando noticias para {ticker}")
    print(f"Noticias en cola: {r.llen(KEY_PENDING)}\n")

    processed = 0

    try:
        while True:
            if watch:
                raw = r.brpop(KEY_PENDING, timeout=0)[1]  # espera hasta que llegue algo
            else:
                raw = r.rpop(KEY_PENDING)
                if raw is None:
                    break

            process_item(r, conn, ticker, raw)
            processed += 1

    except KeyboardInterrupt:
        print("\nParado por el usuario")

    conn.close()
    print(f"\nListo, {processed} noticias analizadas para {ticker}")

    if r.llen(KEY_FAILED):
        print(f"Hay {r.llen(KEY_FAILED)} noticias fallidas en {KEY_FAILED}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python run_analysis.py TICKER [--watch]")
        sys.exit(1)

    run_analysis(sys.argv[1].upper().strip(), watch="--watch" in sys.argv)
