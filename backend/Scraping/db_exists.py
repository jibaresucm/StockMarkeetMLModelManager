from db_connection import get_connection

def news_exists(title):

    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT 1 FROM tech_news WHERE title = %s LIMIT 1"

    cursor.execute(query, (title,))

    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return result is not None