import os

class Settings():
    #MySQL settings
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
    MYSQL_DB = os.environ.get("MYSQL_DB","news_db")
    MYSQL_USER = os.environ.get("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "password")
    
    #Ollama
    OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "localhost")
    OLLAMA_PORT = os.environ.get("OLLAMA_PORT", 11434)
    OLLAMA_MODEL = "Llama3.2"
    
settings = Settings()

