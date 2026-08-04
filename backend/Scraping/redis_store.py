import json
import redis
from settings import settings
# Misma configuración que backend/Analysis/run_analysis.py
REDIS_HOST = settings.REDIS_HOST
REDIS_PORT = settings.REDIS_PORT
REDIS_DB = 0

client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)

def get_redis():
    return client


# Encola una noticia con su id de MySQL para que la analice el worker del LLM.
# Devuelve False si ese id ya se encoló antes.
def queue_news(news_id, title, date, source):
    r = get_redis()

    item = {"id": news_id, "title": title, "date": date.isoformat(), "source": source}
    r.rpush("news:pending", json.dumps(item))

    return True
