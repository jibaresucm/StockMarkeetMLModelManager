import mysql.connector
from mysql.connector import pooling
from settings import settings

db_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="scraper_pool",
    pool_size=10,
    host=settings.MYSQL_HOST,
    user=settings.MYSQL_USER,
    password=settings.MYSQL_PASSWORD,
    database=settings.MYSQL_DB
)

def get_connection():
    return db_pool.get_connection()