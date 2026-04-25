import requests
from bs4 import BeautifulSoup

headers = {
    "User-Agent": "Mozilla/5.0"
}

def get_articles(source, page):

    if page == 1:
        url = source["base_url"]
    else:
        url = f"{source['base_url']}page/{page}/"

    try:
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            print(f"Error HTTP {response.status_code} en página {page}")
            return []

        soup = BeautifulSoup(response.text, "html.parser")

        articles = []
        sel = source["selectors"]

        items = soup.find_all(sel["article"][0], class_=sel["article"][1])

        for item in items:

            title_container = item.find(sel["title_container"][0], class_=sel["title_container"][1])

            if not title_container:
                continue

            link_tag = title_container.find(sel["title_link"])

            if not link_tag:
                continue

            title = link_tag.get_text(strip=True)

            time_tag = item.find(sel["time"])

            if not time_tag:
                continue

            if sel.get("time_attr"):
                time_text = time_tag.get(sel["time_attr"])
            else:
                time_text = time_tag.get_text(strip=True)

            articles.append({
                "title": title,
                "time": time_text
            })

        return articles

    except Exception as e:
        print(f"Error en scraping página {page}: {e}")
        return []