import os
from pathlib import Path

import yfinance as yf
import numpy as np
import re
import talib

def checkForStock(stock):
    df = yf.download(stock, period="1d", progress=False)
    return not df.empty

"""def _generateDataset(stock, periodo, featuresDict):

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

    df["TARGET"] = (df["Close"] > df["Open"] ).astype(int)

    #Agregar columna para cada dia fear index VIX Raw
    df = df.join(vix_df[['Close']].rename(columns={'Close': 'VIX_Raw'}), how='left')
    
    df.dropna(inplace=True)

    #Features de sentimiento
    #Indice del miedo
    if "FEAR_RELATIVE_X" in featuresDict: 
        l = featuresDict["FEAR_RELATIVE_X"]
        fear = df['VIX_Raw']
        for X in l:
            df[f'FEAR_RELATIVE_{X}'] = fear / fear.ewm(span= X, adjust = False).mean()

    #Indice del miedo cambio, mercado general
    if "FEAR_ROC_X" in featuresDict:
        l = featuresDict["FEAR_ROC_X"]
        fear = df["VIX_Raw"]
        
        for X in l:
            df[f"FEAR_ROC_{X}"] = fear - fear.shift(X)
    
    if "FEAR_ABS_DIFF_SUM_X" in featuresDict:
        l = featuresDict["FEAR_ABS_DIFF_SUM_X"]
        fear = df["VIX_Raw"]
        
        for X in l:
            df[f"FEAR_ABS_DIFF_SUM_{X}"] = fear.diff().abs().rolling(X).sum()
    
    #Indice del miedo rareza
    if "FEAR_DIFF_ZSCORE_X" in featuresDict:
        l = featuresDict["FEAR_DIFF_ZSCORE_X"]

        diff = df["VIX_Raw"].diff()
            
        for X in l:
            mean = diff.rolling(X).mean()
            std  = diff.rolling(X).std()
            df[f"FEAR_DIFF_ZSCORE_{X}"] = ((diff - mean) / std)
    
    #Features de tendencia
    if "DCP_X" in featuresDict:
        l = featuresDict["DCP_X"]
        for X in l:
            rolling_max = df['High'].rolling(window=X).max()
            rolling_min = df['Low'].rolling(window=X).min()
            df[f"DCP_{X}"] = (df['Close'] - rolling_min) / (rolling_max - rolling_min + 1e-9)
    
    if "ADX_SMOOTH_X" in featuresDict:
        l = featuresDict["ADX_SMOOTH_X"]
        for X in l:
            df[f"ADX_SMOOTH_{X}"] = talib.ADX(df["High"], df["Low"], df["Close"], timeperiod=X)

    if "ADX_ACCEL_X" in featuresDict:
        l = featuresDict["ADX_ACCEL_X"]
        for X in l:
            adx = talib.ADX(df["High"], df["Low"], df["Close"], timeperiod=X)
            df[f"ADX_ACCEL_{X}"] = adx - adx.shift(4)
            
    #SMA Media de Closing de X dias, distancia a media de closing del día anterior puede ser indicador
    if "DISTANCE_SMA_Z_X" in featuresDict:
        l = featuresDict["DISTANCE_SMA_Z_X"]
        for X in l:
            sma = df["Close"].rolling(X).mean()
            dist_pct = (df["Close"] / sma) -1
            
            window_for_normalization = X * 2
            mean_dist = dist_pct.rolling(window_for_normalization).mean()
            std_dist = dist_pct.rolling(window_for_normalization).std()
        
            df[f"DISTANCE_SMA_Z_{X}"] = (dist_pct - mean_dist) / (std_dist + 1e-9)

    if "DISTANCE_SMA_X" in featuresDict:
        l = featuresDict["DISTANCE_SMA_X"]
        for X in l:
            sma = df["Close"].rolling(X).mean()
            df[f"DISTANCE_SMA_{X}"] = (df["Close"] / sma) -1
            

    #Features de momentum
    
    if "RSI_X" in featuresDict:
        l = featuresDict["RSI_X"]
        for X in l:
            df[f"RSI_{X}"] = talib.RSI(df["Close"], timeperiod=X)
    
    if "ROC_X" in featuresDict:
        l = featuresDict["ROC_X"]
        for X in l:
            df[f'ROC_{X}'] = talib.ROC(df['Close'], timeperiod=X)
    
    if "MFI_X" in featuresDict:
        l = featuresDict["MFI_X"]
        for X in l:
            df[f'MFI_{X}'] = talib.MFI(df['High'], df['Low'], df['Close'], df['Volume'], timeperiod=X)
    
    if "MFI_ROC_X" in featuresDict:
        l = featuresDict["MFI_ROC_X"]
        for X in l:
            mfi = talib.MFI(df['High'], df['Low'], df['Close'], df['Volume'], timeperiod=X)
            df[f"MFI_ROC_{X}"] =  mfi - mfi.shift(5)
    
    if "MFI_ENERGY_X" in featuresDict:
        l = featuresDict["MFI_ENERGY_X"]
        for X in l:
            mfi = talib.MFI(df['High'], df['Low'], df['Close'], df['Volume'], timeperiod=X)
            df[f"MFI_ENERGY_{X}"] =  mfi.abs().rolling(5).sum()
    #Features de aceleración
    
    if "SMOOTH_ACCEL" in featuresDict:
        _, _, macdhist = talib.MACD(df['Close'], fastperiod=12, slowperiod=26, signalperiod=9)
        df['SMOOTH_ACCEL'] = macdhist
        
    if "VOL_ACCEL" in featuresDict:
        vol_speed = df['Volume'].pct_change(3)
        df['VOL_ACCEL'] = vol_speed.diff()

    #Volatilidad media x dias
    if "VOLATILITY_PARK_X" in featuresDict:
        l = featuresDict["VOLATILITY_PARK_X"]
        for X in l:
            log_hl_sq = np.log(df['High'] / df['Low'])**2
            
            sum_log_hl = log_hl_sq.rolling(window=X).sum()
            
            const = 1 / (4 * X * np.log(2))
            
            df[f"VOLATILITY_PARK_{X}"] = np.sqrt(const * sum_log_hl)
    
    if "VOLATILITY_EFFICIENCY" in featuresDict:
        l = featuresDict["VOLATILITY_EFFICIENCY"]
        log_hl_sq = np.log(df['High'] / df['Low'])**2
        
        sum_log_hl = log_hl_sq.rolling(window=20).sum()
        
        const = 1 / (4 * X * np.log(2))
        
        park = np.sqrt(const * sum_log_hl)
        natr = talib.NATR(df['High'], df['Low'], df['Close'], timeperiod=20)
        df["VOLATILITY_EFFICIENCY"] = park / (natr + 1e-9)
    
    if "VOLATILITY_ACCEL_X" in featuresDict:
        l = featuresDict["VOLATILITY_ACCEL_X"]
        for X in l:
            const = 1.0 / (4.0 * np.log(2.0))
            park = np.sqrt(const * (np.log(df['High'] / df['Low'])**2).rolling(window=X).mean())

            vel = np.log(park / park.shift(1))
            accel = vel.diff(periods=2)
            
            df[f"VOLATILITY_ACCEL_{X}"] = (accel - accel.rolling(5).mean()) / (accel.rolling(5).std() + 1e-9)


    if "BB_WIDTH_X" in featuresDict:
        l = featuresDict["BB_WIDTH_X"]
        for X in l:
            upper, middle, lower = talib.BBANDS(df['Close'], timeperiod=X)
            df[f'BB_WIDTH_{X}'] = ((upper - lower) / middle)
    
    if "BB_SQUEEZE_RANK_X" in featuresDict:
        l = featuresDict["BB_SQUEEZE_RANK_X"]
        for X in l:
            upper, middle, lower = talib.BBANDS(df['Close'], timeperiod=X)
            bb = ((upper - lower) / middle)
            
            df[f"BB_SQUEEZE_RANK_{X}"] = bb.rolling(200).rank(pct=True)
    
    if "NATR_X" in featuresDict:
        l = featuresDict["NATR_X"]
        for X in l:
            df[f'NATR_{X}'] = talib.NATR(df['High'], df['Low'], df['Close'], timeperiod=X)
            
    #Indicadores de volumen
    #OBV
    if "OBV_ZSCORE_X" in featuresDict:
        l = featuresDict["OBV_ZSCORE_X"]
        obv = talib.OBV(df['Close'], df['Volume'])
        for X in l:
            df[f'OBV_ZSCORE_{X}'] = ((obv - obv.rolling(X).mean()) / obv.rolling(X).std())
        
    if "OBV_CHANGE_X" in featuresDict:
        l = featuresDict["OBV_CHANGE_X"]
        obv_change = talib.OBV(df['Close'], df['Volume']).diff()
        for X in l:
            df[f'OBV_CHANGE_{X}'] = (obv_change - obv_change.rolling(X).mean()) / obv_change.rolling(X).std()

    if "VOLUME_EFFORT" in featuresDict:
        df["VOLUME_EFFORT"] = ((df["Volume"] / df["Volume"].rolling(X).median()) - 1) / (talib.ROC(df['Close'], timeperiod=5).abs() + 1e-9)
    
    #CMF
    if "CMF_X" in featuresDict:
        l = featuresDict["CMF_X"]
        for X in l:
            mfm = ((df['Close'] - df['Low']) - (df['High'] - df['Close'])) / (df['High'] - df['Low'])
            
            mfm = mfm.fillna(0)
            
            mfv = mfm * df['Volume']
            
            df[f'CMF_{X}'] = (mfv.rolling(window=X).sum() / df['Volume'].rolling(window=X).sum())
    
    #RVOLUME
    if "RVOLUME_X" in featuresDict:
        l = featuresDict["RVOLUME_X"]
        for X in l:
            df[f"RVOLUME_{X}"] = (df["Volume"] / df["Volume"].rolling(X).median()) - 1
    
    #Borrar columnas
    df.drop(a_borrar, axis=1, inplace=True)
    
    print(df.describe())
    return df"""

"""def getFullDatasetDict():
    return {
            #Sentiment
            "FEAR_DIFF_SUM_X": [5, 10, 20], #Cambio de fear
            "FEAR_ABS_DIFF_SUM_X": [5, 10, 20],
            "FEAR_RELATIVE_X": [20, 40], #Fear actual
            "FEAR_DIFF_ZSCORE_X": [10, 15, 20], #Que tan raro es el cambio
            #Tendency
            "DCP_X": [20, 100], #Estructura
            "ADX_SMOOTH_X": [14], #Fuerza tendencia
            "ADX_ACCEL_X": [5, 7],
            "DISTANCE_SMA_X": [40, 60],
            "DISTANCE_SMA_Z_X": [20], #Dirección tendencia
            #Momentum
            #"RSI_X": [14],
            "ROC_X": [5, 7],
            #"MFI_X": [10, 15, 20],
            "MFI_ENERGY_X": [10, 15, 20],
            "MFI_ROC_X": [10, 15, 20],
            #Acceleration
            "SMOOTH_ACCEL": True,
            "VOL_ACCEL": True,
            #Volatility
            "VOLATILITY_PARK_X": [5, 10, 20],
            "VOLATILITY_EFFICIENCY": True,
            "VOLATILITY_ACCEL_X":[5, 10, 20],
            #"BB_WIDTH_X": [10, 20],
            "BB_SQUEEZE_RANK_X": [10, 20],
            #"NATR_X": [15, 20],
            #Volume
            #"OBV_ZSCORE_X": [40, 60],
            "OBV_CHANGE_X": [20, 40],
            "VOLUME_EFFORT": True,
            #"CMF_X": [20, 40],
            "RVOLUME_X": [20, 40],
            #Smart features
        }
"""

#Agregar 300d a todos para evitar na en dias utiles y marcados como "usados"

def _generateDataset(stock, periodo, featuresDict):
     #Close, High, Low, Open, Volume
    df = yf.download(stock, period= f"{periodo}d")
    vix_df = yf.download("^VIX", period= f"{periodo}d")

    df.columns = df.columns.get_level_values(0)
    vix_df.columns = df.columns.get_level_values(0)
    
    df.columns.name = "Indicadores"
    
    a_borrar = ["Close", "High", "Low", "Open", "Volume", "VIX_Raw"]

    #Queremos ver si close > open entonces la normalización se realizará siempre en el mismo día
    #El modelo solo predicirá el target es decir close > open, todo lo demás tienen que ser features que no dependan del día
    #Se esta pensando en si incluir siquiera el open
    #Las features serán aquellas que se refieran a un contexto (window) para que el modelo analize el estado del mercado obviando precios

    df["TARGET"] = (df["Close"] > df["Open"]).astype(int)

    #Agregar columna para cada dia fear index VIX Raw
    df = df.join(vix_df[['Close']].rename(columns={'Close': 'VIX_Raw'}), how='left')
    
    df.dropna(inplace=True)
    """
    
    Features
    
    """
    
    """
    Miedo
    """
    if "FEAR_ENERGY_Z_X" in featuresDict:
        l = featuresDict["FEAR_ENERGY_Z_X"]
        fear = df["VIX_Raw"]
        for X in l:

            absdiff = fear.diff().abs().rolling(X).sum()
            df[f"FEAR_ENERGY_Z_{X}"] = (absdiff - absdiff.rolling(3).mean()) / absdiff.rolling(20).std()
            
    if "FEAR_DIFF_X" in featuresDict:
        l = featuresDict["FEAR_DIFF_X"]
        diff = df["VIX_Raw"].diff()
        
        for X in l:
            df[f"FEAR_DIFF_{X}"] = diff.ewm(span=X, adjust=False).mean()
    
    if"FEAR_RANK_X" in featuresDict:
        l = featuresDict["FEAR_RANK_X"]
        fear = df["VIX_Raw"]
        for X in l:
            df[f"FEAR_RANK_{X}"] = fear.rolling(X).rank(pct=True)
    
    """
    Estructura / Tendencia
    """
    if "DCP" in featuresDict:
        range_day = df['High'] - df['Low']
        dcp = (df['Close'] - df['Low']) / range_day.replace(0, np.nan)
        df[f"DCP"] = dcp.fillna(0.5)

    
    if "ADX_ACCEL_X" in featuresDict:
        l = featuresDict["ADX_ACCEL_X"]

        for X in l:
            adx = talib.ADX(df["High"], df["Low"], df["Close"], timeperiod=X)

            df[f"ADX_ACCEL_{X}"] = (adx - adx.rolling(3).mean()) / adx.rolling(20).std()

    if "DIST_SMA_X" in featuresDict:
        l = featuresDict["DIST_SMA_X"]
        for X in l:
            sma = df['Close'].rolling(window=X).mean()
            df[f"DIST_SMA_{X}"] = (df['Close'] - sma) / sma
            
    """
    Volumen
    """
    
    if "RELATIVE_VOLUME_Z_X" in featuresDict:
        l = featuresDict["RELATIVE_VOLUME_Z_X"]
        for X in l:
            rvol = df['Volume'] / df['Volume'].ewm(span=X, adjust=False).mean()
        
            v_mean = rvol.rolling(3).mean()
            v_std = rvol.rolling(20).std()
            
            df[f"RELATIVE_VOLUME_Z_{X}"] = (rvol - v_mean) / v_std.replace(0, np.nan)
    
    if "VOLUME_RANK_X" in featuresDict:
        l = featuresDict["VOLUME_RANK_X"]
        for X in l:
            df[f"VOLUME_RANK_{X}"] = df['Volume'].rolling(window=X).rank(pct=True)
            
    if "VOLUME_FORCE_X" in featuresDict:
        l = featuresDict["VOLUME_FORCE_X"]
        for X in l:
            log_ret = np.log(df['Close'] / df['Close'].shift(1))
            
            rvol = df['Volume'] / df['Volume'].ewm(span=X, adjust=False).mean()
            
            force_raw = log_ret * rvol
            df[f"VOLUME_FORCE_{X}"] = force_raw.ewm(span=3, adjust=False).mean()

    """
    Volatilidad
    """
    if "VOLATILITY_RATIO" in featuresDict:
        atr_short = talib.ATR(df.High, df.Low, df.Close, timeperiod=3)
        atr_long = talib.ATR(df.High, df.Low, df.Close, timeperiod=20)
        df['VOLATILITY_RATIO'] = atr_short / atr_long
        
    if "VOLATILITY_COMPRESSION" in featuresDict:
        vol_sma5 = df['Close'].diff().abs().rolling(5).mean()
        df['VOL_COMPRESSION'] = vol_sma5 / vol_sma5.rolling(60).max()
        
    """
    Indicadores de tendencia inmediata
    """
    if "MFF_Z_X" in featuresDict:
        l = featuresDict["MFF_Z_X"]
        for X in l:
            tp = (df['High'] + df['Low'] + df['Close']) / 3
            tp_diff = tp.diff()
            
            mf = tp_diff * df['Volume']
            mean_mf = mf.rolling(X).mean()
            std_mf = mf.rolling(X).std()
        
            df[f'MFF_Z_{X}'] = (mf - mean_mf) / std_mf
        
    if "RGM_Z" in featuresDict:
        gap = (df['Open'] - df['Close'].shift(1)) / df['Close'].shift(1)
        df['RGM_Z'] = (gap - gap.rolling(3).mean()) / gap.rolling(7).std()
        
    if "IDS_SHOCK" in featuresDict:
        isinside = (df['High'] <= df['High'].shift(1)) & (df['Low'] >= df['Low'].shift(1))
        rvol = df['Volume'] / df['Volume'].ewm(span=20, adjust=False).mean()
        
        v_mean = rvol.rolling(3).mean()
        v_std = rvol.rolling(20).std()
        
        rvol_z = (rvol - v_mean) / v_std.replace(0, np.nan)
        df["IDS_SHOCK"] = isinside.astype(int) * rvol_z
        
    if "WIN_RATE_Z" in featuresDict:
        is_win = (df['Close'] > df['Close'].shift(1)).astype(int)
        win_rate_raw = is_win.rolling(10).mean()
        
        z_mean = win_rate_raw.rolling(3).mean()
        z_std = win_rate_raw.rolling(20).std()
        df[f'WIN_RATE_Z'] = (win_rate_raw - z_mean) / z_std.replace(0, np.nan)
        
    df.drop(a_borrar, axis=1, inplace=True)
    
    return df

def generateLastDayForPrediction(stock, maxWindow, featuresDict):
    df = _generateDataset(stock, maxWindow, featuresDict)
    
    df.drop("TARGET",axis=1, inplace=True)
    
    df = df.iloc[-1]
    df = df.values.reshape(1, -1)
    
    return df
    
def generateTrainingDataset(stock, period, featuresDict):
    df = _generateDataset(stock, period + 400, featuresDict)
    
    df = df.iloc[400:].copy()
    df["TARGET"] = df["TARGET"].shift(-1)

    df.dropna(inplace=True)

    return df

def getFullDatasetDict():
    return{
        #Miedo
        "FEAR_ENERGY_Z_X": [3, 10],#ABS DIFF SUM de unos 3 a 7 días, normalizada en ventana de X, indica cambios (energia) del miedo
        "FEAR_DIFF_X": [7, 20], #DIFF EMA de ventana X, indica dirección del miedo
        "FEAR_RANK_X": [30, 100], #Rango en porcentaje, indica el valor del miedo respecto a ultimos días
        
        #Tendencia
        "DCP": True, #Media exponencial del dcp ultimos 3 a cuatro dias, DCP calculado con window X
        "ADX_ACCEL_X": [10, 20], #Aceleración de fuerza (en cualquier dirección), indica si el mercado está reforzando la tendencia
        "DIST_SMA_X": [20, 80, 120], #Distancia actual del sma al close, sma de una window X. Indica tendencia general
        
        #Volumen
        "RELATIVE_VOLUME_Z_X": [7, 20], #Volumen relativo a la ema de los ultimos x dias, normalizado ventana z 3, indica tendencia en volumen y rareza del valor en mercado actual
        "VOLUME_RANK_X": [20, 80], #Rank ultimos X días
        "VOLUME_FORCE_X": [20, 40], #Indica la dirección y la validez de esta en el mercado (filtra ruido), Retornos/ rvol de window x
        
        #Volatilidad
        "VOLATILITY_RATIO": True, #Ratio de la volatilidad, ATR3 o 4 / ATR20, demuestra cambios bruscos en la volatilidad
        "VOLATILITY_COMPRESSION": True, # SMA5 / SMAMAX100
        
        #Señales
        "MFF_Z_X": [5, 10, 20], #Z window de 3, mff de x
        "RGM_Z": True, #Relative gap momentum, indica si el relativa gap ha seguido con fuerzas, indica aceleración en el gap
        "IDS_SHOCK": True, #Si el mercado está paradillo y no sobrepasa ni high noi low anterior, junto con volumen explica el estado del mercado
        "WIN_RATE_Z": True #Win ratio de los ultimos dias indica tendencia y ayuda aver si está acabada
    }

def featureListToFeatureDict(feature_list):
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

def cleanFeaturesDict(featuresDict):
    for indicator in list(featuresDict.keys()):
        if(featuresDict[indicator] == False): del featuresDict[indicator]
