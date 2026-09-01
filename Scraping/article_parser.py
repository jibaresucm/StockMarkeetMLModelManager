from newspaper import Article

def parse_article(url):

    try:

        article = Article(url)

        article.download()
        article.parse()

        return {
            "title": article.title,
            "date": article.publish_date
            }

    except:

        return None