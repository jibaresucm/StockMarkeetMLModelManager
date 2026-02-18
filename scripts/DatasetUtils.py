import yfinance as yf
import pandas as pd
from ta.momentum import RSIIndicator
import matplotlib.pyplot as plt
import numpy as np

def checkForStock(stock):
    df = yf.download(stock, period="1d")
    return not df.empty

def _generateDataset(stock, periodo, featuresDict):
    
    """Devuelve un df de pandas que contiene las opciones especificadas en featuresDict"""

    #Close, High, Low, Open, Volume
    df = yf.download(stock, period= periodo)
    vix_df = yf.download("^VIX", period= periodo)


    df.columns = df.columns.get_level_values(0)
    vix_df.columns = df.columns.get_level_values(0)
    
    df.columns.name = "Indicadores"
    
    a_borrar = ["Close", "High", "Low", "Open", "Volume", "VIX_Raw"]

    #Queremos ver si close > open entonces la normalización se realizará siempre en el mismo día
    #El modelo solo predicirá el target es decir close > open, todo lo demás tienen que ser features que no dependan del día
    #Se esta pensando en si incluir siquiera el open
    #Las features serán aquellas que se refieran a un contexto (window) para que el modelo analize el estado del mercado obviando precios

    #Shift(1) == Val fila anterior
    df["TARGET"] = (df["Close"] > df["Open"] ).astype(int)

    #Agregar columna para cada dia fear index VIX Raw
    df = df.join(vix_df[['Close']].rename(columns={'Close': 'VIX_Raw'}), how='left')

    #Indice del miedo
    if "FEAR_IDX" in featuresDict: 
        df['FEAR_IDX'] = df['VIX_Raw']

    #Indice del miedo cambio, mercado general
    if "FEAR_IDX_PCT" in featuresDict:    
        df["FEAR_IDX_PCT"] = df["VIX_Raw"].pct_change()
    
    #Indice del miedo media ultimos x dias
    if "FEAR_IDX_LAST_X" in featuresDict:
        X = featuresDict["FEAR_IDX_LAST_X"]
        df[f"FEAR_IDX_LAST_X"] = df["VIX_Raw"].rolling(X).mean()
    
    #SMA Media de Closing de X dias, distancia a media de closing del día anterior puede ser indicador
    if "DISTANCE_TO_SMA_X" in featuresDict:
        X = featuresDict["DISTANCE_TO_SMA_X"]
        df[f"SMA_X"] = df["Close"].rolling(X).mean()
        df[f"DISTANCE_TO_SMA_X"] = (df["Close"] / df[f"SMA_X"]) -1
        
        a_borrar.append("SMA_X")
        
    #Porcentaje de cambio respecto al open, baja o sube en un dia
    if "CHANGE_PCT" in featuresDict:
        df["CHANGE_PCT"] = (df["Close"] - df["Open"]) / df["Open"].shift(1)

    #Volatilidad del dia
    if "VOLATILITY_PARK" in featuresDict:
        df["VOLATILITY_PARK"] = np.sqrt(1 / (4 * np.log(2)) * (np.log(df['High'] / df['Low'])**2))

    #Volatilidad media x dias
    if "VOLATILITY_PARK_LAST_X" in featuresDict:
        X = featuresDict["VOLATILITY_PARK_LAST_X"]
        if "VOLATILITY_PARK" not in df:
            df["VOLATILITY_PARK"] = np.sqrt(1 / (4 * np.log(2)) * (np.log(df['High'] / df['Low'])**2))
            
        df[f"VOLATILITY_PARK_LAST_X"] = df["VOLATILITY_PARK"].rolling(X).mean()

    #Si columna no deseada en df
    if "VOLATILITY_PARK" not in featuresDict and "VOLATILITY_PARK" in df:
        a_borrar.append("VOLATILITY_PARK")
    
    #Indica si cierra cerca del máximo o del minimo Close position range
    if "CPR" in featuresDict:
        df['CPR'] = (df['Close'] - df['Low']) / (df['High'] - df['Low'])

    #RSI Indicador de momentum 14 dias estandard
    if "RSI" in featuresDict:
        df["RSI"] = RSIIndicator(df["Close"]).rsi() 

    if "RSI_PCT" in featuresDict:
        if "RSI" not in df:
            df["RSI"] = RSIIndicator(df["Close"]).rsi()
            
        df["RSI_PCT"] = df["RSI"].diff()
        
    if "RSI" not in featuresDict and "RSI" in df:
        a_borrar.append("RSI")
        
    #RVOL
    if "RVOL_WITH_LAST_X" in featuresDict:
        X = featuresDict["RVOL_WITH_LAST_X"]
        df[f"RVOL_WITH_LAST_X"] = (df["Volume"] / df["Volume"].rolling(X).mean()) - 1
    
    #Borrar columnas
    df.drop(a_borrar, axis=1, inplace=True)
    
    return df

def generateLastDayForPrediction(stock, maxWindow, featuresDict):
    df = _generateDataset(stock, maxWindow, featuresDict)
    
    df.drop("TARGET",axis=1, inplace=True)
    
    return df
    
def generateTrainingDataset(stock, period, featuresDict):
    df = _generateDataset(stock, period, featuresDict)
    
    df["TARGET"] = df["TARGET"].shift(-1)
    
    df = df.shift(1)

    df.dropna(inplace=True)
    
    return df

def getFeatures():
    return ["FEAR_IDX",
            "FEAR_IDX_PCT",
            "FEAR_IDX_LAST_X"
            "DISTANCE_TO_SMA_X",
            "CHANGE_PCT",
            "VOLATILITY_PARK",
            "VOLATILITY_PARK_LAST_X",
            "CPR",
            "RSI",
            "RSI_PCT"
            "RVOL_WITH_LAST_X"
            ]


ticker = "AMZN"
#print(checkForStock(ticker))
#print(generateTrainingDataset(ticker, "1500d", {"RVOL_WITH_LAST_X": 14, "VOLATILITY_PARK_LAST_X": 14, "RSI_PCT": 1, "RSI": 1, "DISTANCE_TO_SMA_X": 14, "CPR": 1, "FEAR_IDX":1}))