import json
import redis

# Misma configuración que backend/Analysis/run_analysis.py
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 0


def get_redis():
    return redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)


# Encola una noticia con su id de MySQL para que la analice el worker del LLM.
# Devuelve False si ese id ya se encoló antes.
def queue_news(news_id, title, date, source):
    r = get_redis()

    if not r.sadd("news:seen", news_id):
        return False

    item = {"id": news_id, "title": title, "date": date.isoformat(), "source": source}
    r.lpush("news:pending", json.dumps(item))

    return True
