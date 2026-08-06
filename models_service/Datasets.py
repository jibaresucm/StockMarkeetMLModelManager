import numpy as np
import yfinance as yf
from datetime import datetime
import re
from Features import feature_functions
from Targets import apply_target
from EventSampling import apply_event_sampling
from SentimentData import get_news_df

def checkForStock(stock):
    df = yf.download(stock, period="1d")
    return not df.empty

def fetchColumns(stock, periodo):
    df = yf.download(stock, period= f"{periodo}d")
    vix_df = yf.download("^VIX", period= f"{periodo}d")
    sentiment_df = get_news_df(period=periodo)
    
    df.columns = df.columns.get_level_values(0)
    vix_df.columns = vix_df.columns.get_level_values(0)
    
    df = df.join(vix_df[['Close']].rename(columns={'Close': 'VIX_Raw'}), how='left')
    df = df.join(sentiment_df, how = 'left')
    
    
    df.columns.name = "Indicadores"
    
    return df

def _generateDataset(stock, periodo, dataset, objective):
     #Close, High, Low, Open, Volume
    df = fetchColumns(stock, periodo)
    
    a_borrar = ["Close", "High", "Low", "Open", "Volume", "VIX_Raw", "sentiment", "market_impact"]

    apply_target(df, objective.get("TARGET", "NextDay"))
    
    
    for feature, config in dataset.items():
        funct = feature_functions[feature]
        if feature[-2:] == "_X":
            for window in config:
               feature_str = f"{feature[:-2]}_{window}"
               df[feature_str] = funct(df, window = window)
               
        elif feature:
            df[feature] = funct(df)

    df = apply_event_sampling(df, objective.get("SAMPLING", None))
    
    #Se borran columnas con features inservibles
    df.drop(a_borrar, axis=1, inplace=True)
    
    return df

def generateLastPredictionRow(stock, dataset, objective):
    df = _generateDataset(stock, 400, dataset, objective)
    
    df.drop("TARGET",axis=1, inplace=True)
    
    now = datetime.now()
    
    date = df.iloc[-1].name.to_pydatetime()
    
    if date.date() == now.date():
        df = df.iloc[-2]
    else:
        df = df.iloc[-1]

    final_date = df.name.to_pydatetime()
    print(df)

    df = df.values.reshape(1, -1)
    
    return {"date": final_date, "data": df}

def generateTrainingDataset(stock, period, dataset, objective):
    df = _generateDataset(stock, period + 400, dataset, objective)
    
    df = df.iloc[-period:].copy()

    df.dropna(inplace=True)
    
    print(df)
    
    return df

def getSampleDataset():
    return{
        #Miedo
        "FEAR_ENERGY_Z_X": [3, 10],#ABS DIFF SUM de unos 3 a 7 días, normalizada en ventana de X, indica cambios (energia) del miedo
        "FEAR_DIFF_X": [7, 20], #DIFF EMA de ventana X, indica dirección del miedo
        "FEAR_RANK_X": [30, 100], #Rango en porcentaje, indica el valor del miedo respecto a ultimos días
        
        #Tendencia
        "DCP": True, #Media exponencial del dcp ultimos 3 a cuatro dias, DCP calculado con window X
        "ADX_X": [5, 10],
        "ADX_ACCEL_X": [10, 20], #Aceleración de fuerza (en cualquier dirección), indica si el mercado está reforzando la tendencia
        "DIST_SMA_X": [2 ,3 ,20, 80, 120], #Distancia actual del sma al close, sma de una window X. Indica tendencia general
        "KAUFMAN_ER": True,
        "HURST_X": [10, 20],
        "ROC": True,
        
        #Volumen
        "RVOL_X": [10, 40],
        "RELATIVE_VOLUME_Z_X": [7, 20], #Volumen relativo a la ema de los ultimos x dias, normalizado ventana z 3, indica tendencia en volumen y rareza del valor en mercado actual
        "VOLUME_RANK_X": [20, 80], #Rank ultimos X días
        "VOLUME_FORCE_X": [20, 40], #Indica la dirección y la validez de esta en el mercado (filtra ruido), Retornos/ rvol de window x
        "VPIN_DIRECTIONAL_X": [20],
        "AMIHUD_ILLIQUIDITY_X": [20],
        "VT_ACCELERATION_Z_X": [10],
        
        #Volatilidad
        "VOLATILITY_RATIO": True, #Ratio de la volatilidad, ATR3 o 4 / ATR20, demuestra cambios bruscos en la volatilidad
        "VOLATILITY_COMPRESSION": True, # SMA5 / SMAMAX100
        "YANG_ZHANG_X": [20],
        "CORWIN_SCHULTZ_Z_X": [20],
        
        #Señales
        "MFF_Z_X": [5, 10, 20], #Z window de 3, mff de x
        "RGM_Z": True, #Relative gap momentum, indica si el relativa gap ha seguido con fuerzas, indica aceleración en el gap
        "IDS_SHOCK": True, #Si el mercado está paradillo y no sobrepasa ni high noi low anterior, junto con volumen explica el estado del mercado
        "WIN_RATE": True #Win ratio de los ultimos dias indica tendencia y ayuda a ver si está acabada
    }

def getExhaustiveDataset():
    return {#Miedo
        "FEAR_ENERGY_Z_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200],#ABS DIFF SUM de unos 3 a 7 días, normalizada en ventana de X, indica cambios (energia) del miedo
        "FEAR_DIFF_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200], #DIFF EMA de ventana X, indica dirección del miedo
        "FEAR_RANK_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200], #Rango en porcentaje, indica el valor del miedo respecto a ultimos días
        
        #Tendencia
        "DCP": True, #Media exponencial del dcp ultimos 3 a cuatro dias, DCP calculado con window X
        "ADX_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200],
        "ADX_ACCEL_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200], #Aceleración de fuerza (en cualquier dirección), indica si el mercado está reforzando la tendencia
        "DIST_SMA_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200], #Distancia actual del sma al close, sma de una window X. Indica tendencia general
        "KAUFMAN_ER": True,
        "HURST_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200],
        "ROC": True,
        
        #Volumen
        "RVOL_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200],
        "RELATIVE_VOLUME_Z_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200], #Volumen relativo a la ema de los ultimos x dias, normalizado ventana z 3, indica tendencia en volumen y rareza del valor en mercado actual
        "VOLUME_RANK_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200], #Rank ultimos X días
        "VOLUME_FORCE_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200], #Indica la dirección y la validez de esta en el mercado (filtra ruido), Retornos/ rvol de window x
        "VPIN_DIRECTIONAL_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200],
        "AMIHUD_ILLIQUIDITY_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200],
        "VT_ACCELERATION_Z_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200],
        
        #Volatilidad
        "VOLATILITY_RATIO": True, #Ratio de la volatilidad, ATR3 o 4 / ATR20, demuestra cambios bruscos en la volatilidad
        "VOLATILITY_COMPRESSION": True, # SMA5 / SMAMAX100
        "YANG_ZHANG_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200],
        "CORWIN_SCHULTZ_Z_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200],
        
        #Señales
        "MFF_Z_X": [3, 7, 10, 15, 20, 40, 60, 80, 100, 150, 200], #Z window de 3, mff de x
        "RGM_Z": True, #Relative gap momentum, indica si el relativa gap ha seguido con fuerzas, indica aceleración en el gap
        "IDS_SHOCK": True, #Si el mercado está paradillo y no sobrepasa ni high noi low anterior, junto con volumen explica el estado del mercado
        "WIN_RATE": True #Win ratio de los ultimos dias indica tendencia y ayuda a ver si está acabada
    }

def featureListToDatasetDict(feature_list):
    dict = {}
    for string in feature_list:
        
        regex = re.search(r'(\d+)$', string)
        if regex:
            periodo = int(regex.group(1))
            nombre = re.sub(r'(\d+)$', "X", string)
            
            if nombre in dict:
                dict[nombre].append(periodo)
            else:
                dict[nombre] = [periodo]
        else:
            dict[string] = True
    
    return dict

def cleanDatasetDict(featuresDict):
    for indicator in list(featuresDict.keys()):
        if(featuresDict[indicator] == False): del featuresDict[indicator]
