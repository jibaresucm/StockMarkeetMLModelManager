from mysql_connection import get_connection
from datetime import datetime, timedelta
import pandas as pd

def get_news(date):
    query = ("SELECT date, sentiment, market_impact FROM news_analysis "
             "WHERE date >= %s ORDER BY date ASC LIMIT 2000;")
    
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, (date,))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return results

def get_news_df(period):
    date = datetime.now() - timedelta(days=period)
    
    data = get_news(date)
    
    grouped_data = {}
    for row in data:
        row_date = row["date"]
        row_date = row_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        if row_date in grouped_data:
            grouped_data[row_date]["market_impact"] += row["market_impact"]
            grouped_data[row_date]["sentiment"] += row["sentiment"]
        else:
            grouped_data[row_date] = {"sentiment": row["sentiment"], "market_impact": row["market_impact"]}
    
    clean_data = []
    for day, analysis in grouped_data.items():
        clean_data.append({"Date": day, "sentiment": analysis["sentiment"], "market_impact": analysis["market_impact"]})
        
    print(clean_data)
    df = pd.DataFrame(clean_data, columns=["Date", "sentiment", "market_impact"])
    df["Date"] = pd.to_datetime(df["Date"])
    df.set_index('Date', inplace=True)
    
    return df

if __name__ == "__main__":
    get_news_df(datetime.date(2004, 1, 1))