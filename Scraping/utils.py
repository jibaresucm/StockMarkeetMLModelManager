from datetime import datetime

def parse_date(time_text):
    try:
        return datetime.fromisoformat(time_text).replace(tzinfo=None)
    except:
        return None