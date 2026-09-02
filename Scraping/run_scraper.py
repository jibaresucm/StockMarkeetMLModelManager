from datetime import datetime, timedelta
import time
import random   

from source_config import TECH_SOURCES
from generic_scraper import get_articles
from db_insert import insert_news
from redis_store import queue_news
from utils import parse_date
from scraper_state import load_last_page, save_last_page

def run_scraper():

    limite_dias = (datetime.now() - timedelta(days=3000)).replace(tzinfo=None)
    for source in TECH_SOURCES:

        print(f"\n--- Iniciando Scraping: {source['name']} ---")

        pagina = load_last_page(source["name"])
        reached = False
        while not reached:

            print(f"\nAnalizando página {pagina}...")

            articles = get_articles(source, pagina)

            if articles is None:

                print(f"Error en la página {pagina}")

                save_last_page(source["name"], pagina)

                print("Esperando 3 minutos...")

                time.sleep(180)

                continue
            
            if len(articles) == 0:
                print("No hay más artículos. Fin.")
                break

            for article in articles:

                title = article["title"]
                time_text = article["time"]

                date = parse_date(time_text)

                if not date:
                    print("Fecha no válida")
                    continue

                if date < limite_dias:
                    reached = True
                    break

                print(f"Guardando: {title} ({date.strftime('%Y-%m-%d')})")

                try:
                    news_id = insert_news(title, date)
                except Exception as e:
                    print("Error insertando:", e)
                    continue

                try:
                    queue_news(news_id, title, date, source["name"])
                except Exception as e:
                    print("Error encolando en Redis:", e)

            save_last_page(source["name"], pagina)

            pagina += 1
            time.sleep(random.uniform(2, 5))
        print("Noticias de los ultimos 3000 dias scrapeadas")
    return True


if __name__ == "__main__":
    run_scraper()