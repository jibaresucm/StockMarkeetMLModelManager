import requests
from bs4 import BeautifulSoup
import time
import random

headers = {
    "User-Agent": "Mozilla/5.0"
}


def get_articles(source, page):
    
    if page == 1:
        url = source["base_url"]
    else:
        url = f"{source['base_url']}page/{page}/"

    max_retries = 3

    for attempt in range(max_retries):

        try:
            response = requests.get(url, headers=headers, timeout=15)

            if response.status_code == 403:
                print(f"HTTP 403 en página {page}. Bloqueado por la web.")
                return None

            if response.status_code != 200:
                print(f"Error HTTP {response.status_code} en página {page}")
                return []

            soup = BeautifulSoup(response.text, "html.parser")

            articles = []
            sel = source["selectors"]

            items = soup.find_all(
                sel["article"][0],
                class_=sel["article"][1]
            )

            for item in items:

                title_container = item.find(
                    sel["title_container"][0],
                    class_=sel["title_container"][1]
                )

                if not title_container:
                    continue

                link_tag = title_container.find(sel["title_link"])

                if not link_tag:
                    continue

                title = link_tag.get_text(strip=True)

                if len(title) < 15:
                    continue

                time_tag = item.find(sel["time"])

                if not time_tag:
                    continue

                if sel.get("time_attr"):
                    time_text = time_tag.get(sel["time_attr"])
                else:
                    time_text = time_tag.get_text(strip=True)

                if not time_text:
                    continue

                articles.append({
                    "title": title,
                    "time": time_text
                })

            return articles

        except requests.exceptions.Timeout:
            print(f"Intento {attempt + 1}/{max_retries} fallido en página {page}: Timeout")

        except requests.exceptions.ConnectionError as e:
            print(f"Intento {attempt + 1}/{max_retries} fallido en página {page}: ConnectionError - {e}")

        except Exception as e:
            print(f"Intento {attempt + 1}/{max_retries} fallido en página {page}: {e}")

        if attempt < max_retries - 1:
            wait = random.uniform(5, 10)
            print(f"Reintentando en {wait:.1f} segundos...")
            time.sleep(wait)

    print(f"Página {page} falló definitivamente.")
    return None