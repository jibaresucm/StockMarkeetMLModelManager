import os

class Settings():
    #MySQL settings
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
    MYSQL_DB = os.environ.get("MYSQL_DB","news_db")
    MYSQL_USER = os.environ.get("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "password")
    
    
    #Redis settings
    REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
    REDIS_PORT = os.environ.get("REDIS_PORT", 6379)

settings = Settings()