from source_config import TECH_SOURCES
from generic_scraper import get_articles
from db_insert import insert_news
from db_exists import news_exists
from utils import parse_date

import time


def monitor_latest():

    source = TECH_SOURCES[0]

    while True:

        print("Comprobando noticias nuevas")

        articles = get_articles(source, 1)

        for article in articles:

            title = article["title"]

            if not news_exists(title):

                date = parse_date(article["time"])

                insert_news(title, date)

                print("Nueva noticia guardada:", title)

            else:

                print("No hay noticias nuevas")
                break

        time.sleep(60)
        
        
        
if __name__ == "__main__":
    monitor_latest()