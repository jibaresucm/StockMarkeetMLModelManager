from source_config import TECH_SOURCES
from generic_scraper import get_article_links
from article_parser import parse_article
from db_insert import insert_news


def run_scraper():
    for source in TECH_SOURCES:

        print("Scraping source:", source["name"])

        links = get_article_links(source["url"])

        for link in links:

            article = parse_article(link)

            if article and article["title"]:

                title = article["title"]
                date = article["date"]

                print("Saving:", title)

                insert_news(title, date)

    return True