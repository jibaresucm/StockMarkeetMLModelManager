from db_connection import get_connection

def insert_news(title, date):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        query = "INSERT INTO tech_news (title, date) VALUES (%s, %s)"

        cursor.execute(query, (title, date))

        conn.commit()

        news_id = cursor.lastrowid
    except:
        pass

    cursor.close()
    conn.close()
    
    return news_id