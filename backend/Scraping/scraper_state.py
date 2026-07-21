from db_connection import get_connection


def load_last_page(source):

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT last_page
        FROM scraper_state
        WHERE source = %s
    """

    cursor.execute(query, (source,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if result:
        return result[0]

    return 1


def save_last_page(source, page):

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO scraper_state (source, last_page)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE
        last_page = VALUES(last_page)
    """

    cursor.execute(query, (source, page))

    conn.commit()

    cursor.close()
    conn.close()