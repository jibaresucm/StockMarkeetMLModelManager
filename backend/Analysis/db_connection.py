import mysql.connector
from mysql.connector import pooling

db_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="scraper_pool",
    pool_size=5,  # Mantiene 5 conexiones listas en memoria
    host="localhost",
    user="root",
    password="password",
    database="news_db"
)

def get_connection():
    return db_pool.get_connection()