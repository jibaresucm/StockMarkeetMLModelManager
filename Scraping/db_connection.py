import time
import mysql.connector
from mysql.connector import pooling
from settings import settings

def create_db_pool():
    max_retries = 10
    retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            pool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name="scraper_pool",
                pool_size=5,
                host=settings.MYSQL_HOST,
                user=settings.MYSQL_USER,
                password=settings.MYSQL_PASSWORD,
                database=settings.MYSQL_DB
            )
            print("Conectado exitosamente a MySQL.")
            return pool
        except (mysql.connector.errors.InterfaceError, mysql.connector.errors.OperationalError):
            if attempt < max_retries - 1:
                print(f"MySQL no disponible. Reintentando en {retry_delay}s... (Intento {attempt + 1}/{max_retries})")
                time.sleep(retry_delay)
            else:
                raise

db_pool = create_db_pool()

def get_connection():
    return db_pool.get_connection()