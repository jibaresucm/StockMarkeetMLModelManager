from datetime import datetime, timedelta
import time

from source_config import TECH_SOURCES
from generic_scraper import get_articles
from db_insert import insert_news
from utils import parse_date


def run_scraper():

    limite_1000_dias = (datetime.now() - timedelta(days=1000)).replace(tzinfo=None)
    for source in TECH_SOURCES:

        print(f"\n--- Iniciando Scraping: {source['name']} ---")

        pagina = 1

        while True:

            print(f"\nAnalizando página {pagina}...")

            articles = get_articles(source, pagina)

            if not articles:
                print("No hay más artículos. Fin.")
                break

            old_count = 0

            for article in articles:

                title = article["title"]
                time_text = article["time"]

                date = parse_date(time_text)

                if not date:
                    print("Fecha no válida")
                    continue

                if date < limite_1000_dias:
                    old_count += 1
                    continue

                print(f"Guardando: {title} ({date.strftime('%Y-%m-%d')})")

                try:
                    insert_news(title, date)
                except Exception as e:
                    print("Error insertando:", e)

            if old_count == len(articles):
                print("Noticias demasiado antiguas. Parando scraper.")
                break

            pagina += 1
            time.sleep(1.5)

    print("\nScraping finalizado.")
    return True


if __name__ == "__main__":
    run_scraper()