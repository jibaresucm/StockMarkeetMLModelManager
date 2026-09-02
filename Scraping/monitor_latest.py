from source_config import TECH_SOURCES
from generic_scraper import get_articles
from db_insert import insert_news
from db_exists import news_exists
from utils import parse_date

import time


def monitor_latest():

    source = TECH_SOURCES[0]

    
    while True:
        time.sleep(60)
        curr = 1
        reached = False
        print("Comprobando noticias nuevas")


        while not reached:
            articles = get_articles(source, curr)
            for article in articles:

                title = article["title"]

                if not news_exists(title):

                    date = parse_date(article["time"])

                    insert_news(title, date)

                    print("Nueva noticia guardada:", title)

                else:
                    reached = True
                    print("No hay noticias nuevas")
                    break
            curr += 1

        
        
        
if __name__ == "__main__":
    monitor_latest()