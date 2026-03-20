import requests
from bs4 import BeautifulSoup

headers = {"User-Agent": "Mozilla/5.0"}

def get_article_links(source_url):

    response = requests.get(source_url, headers=headers)

    soup = BeautifulSoup(response.text, "html.parser")

    links = []

    for a in soup.find_all("a", href=True):

        href = a["href"]

        if "http" in href:

            links.append(href)

    return list(set(links))