import numpy as np
import pandas as pd
import talib

def fear_energy(df, window = 20):
    fear = df["VIX_Raw"]
    absdiff = fear.diff().abs().rolling(window).sum()
    return (absdiff - absdiff.rolling(3).mean()) / absdiff.rolling(20).std()
    
def fear_diff(df, window = 20):
    diff = df["VIX_Raw"].diff()
    return diff.ewm(span=window, adjust=False).mean()

def fear_rank(df, window = 20):
    fear = df["VIX_Raw"]
    return fear.rolling(window).rank(pct=True)
    
def dcp(df, window = None):
    range_day = df['High'] - df['Low']
    dcp = (df['Close'] - df['Low']) / range_day.replace(0, np.nan)
    return dcp.fillna(0.5)

def adx_accel(df, window = 20):
    adx = talib.ADX(df["High"], df["Low"], df["Close"], timeperiod=window)
    return adx - adx.shift(2)
    #return np.zeros(len(df))  # Placeholder

def adx(df, window= 20):
    adx = talib.ADX(df["High"], df["Low"], df["Close"], timeperiod=window)
    return adx
    #return np.zeros(len(df))  # Placeholder

def dist_sma(df, window = 20):
    sma = df['Close'].rolling(window=window).mean()
    return (df['Close'] - sma) / sma

def relative_volume_z(df, window = 20):
    rvol = df['Volume'] / df['Volume'].ewm(span=window, adjust=False).mean()
        
    v_mean = rvol.rolling(3).mean()
    v_std = rvol.rolling(20).std()
    
    return (rvol - v_mean) / v_std.replace(0, np.nan)
def rvol(df, window = 20):
    vol_mean = df['Volume'].rolling(window=window).mean()
    return (df['Volume'] - vol_mean) / vol_mean

def volume_rank(df, window = 20):
    return df['Volume'].rolling(window=window).rank(pct=True)

def volume_force(df, window = 20):
    log_ret = np.log(df['Close'] / df['Close'].shift(1))
    
    rvol = df['Volume'] / df['Volume'].ewm(span=window, adjust=False).mean()
    
    force_raw = log_ret * rvol
    return force_raw.ewm(span=3, adjust=False).mean()

def volatility_ratio(df, window = None):
    atr_short = talib.ATR(df.High, df.Low, df.Close, timeperiod=3)
    atr_long = talib.ATR(df.High, df.Low, df.Close, timeperiod=20)
    return atr_short / atr_long
    #return np.ones(len(df))  # Placeholder

def volatility_compression(df, window = None):
    vol_sma5 = df['Close'].diff().abs().rolling(5).mean()
    return vol_sma5 / vol_sma5.rolling(60).max()

def mff_z(df, window = 20):
    tp = (df['High'] + df['Low'] + df['Close']) / 3
    tp_diff = tp.diff()
    
    mf = tp_diff * df['Volume']
    mean_mf = mf.rolling(window).mean()
    std_mf = mf.rolling(window).std()

    return (mf - mean_mf) / std_mf

def rgm_z(df, window = None):
    gap = (df['Open'] - df['Close'].shift(1)) / df['Close'].shift(1)
    return (gap - gap.rolling(3).mean()) / gap.rolling(7).std()

def ids_shock(df, window = None):
    isinside = (df['High'] <= df['High'].shift(1)) & (df['Low'] >= df['Low'].shift(1))
    rvol = df['Volume'] / df['Volume'].ewm(span=20, adjust=False).mean()
    
    v_mean = rvol.rolling(3).mean()
    v_std = rvol.rolling(20).std()
    
    rvol_z = (rvol - v_mean) / v_std.replace(0, np.nan)
    return isinside.astype(int) * rvol_z

def win_rate(df, window = None): 
    is_win = (df['Close'] > df['Close'].shift(1)).astype(int)
    win_rate_raw = is_win.rolling(10).mean()
    
    return win_rate_raw

def roc(df, window = None):
    rate = df["Close"].pct_change()
    
    return rate

def day_returns(df, window = None):
    ret = df["Close"] / df["Open"]
    ret = ret[ret > 1]
    
    return ret
def yang_zhang_volatility(df, window=20):
    """
    Calcula la Volatilidad de Yang-Zhang para un DataFrame con OHLC.
    df: DataFrame con columnas 'Open', 'High', 'Low', 'Close'
    window: Ventana de tiempo (normalmente 20 o 22 días)
    """
    log_ho = np.log(df['High'] / df['Open'])
    log_lo = np.log(df['Low'] / df['Open'])
    log_co = np.log(df['Close'] / df['Open'])
    
    log_oc = np.log(df['Open'] / df['Close'].shift(1))
    
    sigma_open = log_oc.rolling(window=window).var()
    
    sigma_close = log_co.rolling(window=window).var()
    
    rs_vol = (log_ho * (log_ho - log_co) + log_lo * (log_lo - log_co)).rolling(window=window).mean()
    
    k = 0.34 / (1.34 + (window + 1) / (window - 1))
    
    yz_var = sigma_open + k * sigma_close + (1 - k) * rs_vol
    
    return np.sqrt(yz_var)

def hurst_exponent(df, window=80):
    """
    Calcula el Exponente de Hurst y devuelve solo la columna (Series).
    """
    def hurst_logic(ts):
        if len(ts) < 10: 
            return 0.5
        
        # 1. Retornos logarítmicos
        rets = np.diff(np.log(ts))
        n = len(rets)
        
        # 2. Serie acumulada centrada
        z = np.cumsum(rets - np.mean(rets))
        
        # 3. Rango reescalado
        r = np.max(z) - np.min(z)
        s = np.std(rets)
        
        if s == 0 or r == 0: 
            return 0.5
        
        # 4. Cálculo de H
        h = np.log(r / s) / np.log(n)
        
        return np.clip(h, 0, 1)

    # Retorna solo la serie resultante
    return df["Close"].rolling(window=window).apply(hurst_logic)

def amihud_illiquidity(df, window=20):
    """
    Calcula el Ratio de Iliquidez de Amihud.
    Retorna una Serie con el promedio móvil del ratio.
    """
    abs_ret = np.abs(df['Close'].pct_change())
    
    dollar_volume = df['Close'] * df['Volume']
    
    daily_illiquidity = abs_ret / dollar_volume
    
    amihud = daily_illiquidity.rolling(window=window).mean() * 1e6
    
    rolling_z = 100
    
    mean = amihud.rolling(window=rolling_z).mean()
    std = amihud.rolling(window=rolling_z).std()
    
    return (amihud - mean) / std

def kaufman_er(df, window=10):
    """
    Calcula el Efficiency Ratio (ER) de Kaufman.
    ER = Cambio Neto / Suma de cambios absolutos (Ruido)
    """
    change = np.abs(df['Close'] - df['Close'].shift(window))
    
    daily_diff = np.abs(df['Close'] - df['Close'].shift(1))
    
    volatility = daily_diff.rolling(window=window).sum()
    
    er = change / volatility
    
    return er

def corwin_schultz_z(df, window=20, z_window=50):
    log_hl = np.log(df['High'] / df['Low'])
    log_hl_2d = np.log(df['High'].rolling(2).max() / df['Low'].rolling(2).min())
    
    gamma = log_hl**2 + log_hl.shift(1)**2
    beta = log_hl_2d**2
    
    denominador = 3 - 2 * np.sqrt(2)
    alpha = (np.sqrt(2 * gamma) - np.sqrt(gamma)) / denominador - np.sqrt(beta.clip(lower=0) / denominador)
    
    spread = 2 * (np.exp(alpha) - 1) / (1 + np.exp(alpha))
    cs_raw = spread.clip(lower=0)
    
    cs_smooth = cs_raw.rolling(window=window).mean()

    rolling_mean = cs_smooth.rolling(window=z_window).mean()
    rolling_std = cs_smooth.rolling(window=z_window).std()
    
    return (cs_smooth - rolling_mean) / rolling_std

def vpin_directional(df, window=20):
    """
    Retorna el desequilibrio neto normalizado.
    1: Todo el volumen es compra.
    -1: Todo el volumen es venta.
    """
    denom = (df['High'] - df['Low']).replace(0, np.nan)
    
    buy_factor = (df['Close'] - df['Low']) / denom
    
    vol_buy = df['Volume'] * buy_factor
    vol_sell = df['Volume'] * (1 - buy_factor)
    
    net_imbalance = (vol_buy - vol_sell).rolling(window).sum()
    total_volume = df['Volume'].rolling(window).sum()
    
    return net_imbalance / total_volume

def vt_acceleration_z(df, window=5, window_z=20):
    """
    Calcula el Z-Score de la aceleración del Price Volume Trend.
    Detecta anomalías en la fuerza del movimiento.
    """
    pvt = (df['Volume'] * df['Close'].pct_change()).cumsum()
    
    pvt_acc = pvt.diff(periods=window)
    
    rolling_mean = pvt_acc.rolling(window=window_z).mean()
    rolling_std = pvt_acc.rolling(window=window_z).std()
    
    pvt_z = (pvt_acc - rolling_mean) / rolling_std
    
    return pvt_z

feature_functions = {
    #Miedo
    "FEAR_ENERGY_Z_X": fear_energy,
    "FEAR_DIFF_X": fear_diff,
    "FEAR_RANK_X": fear_rank,
    
    #Tendencia
    "DCP": dcp,
    "ADX_X": adx,
    "ADX_ACCEL_X": adx_accel,
    "DIST_SMA_X": dist_sma,
    "KAUFMAN_ER": kaufman_er,
    "HURST_X": hurst_exponent,
    "ROC": roc,
    "DAY_RETURNS": day_returns,
    
    #Volumen
    "RVOL_X": rvol,
    "RELATIVE_VOLUME_Z_X": relative_volume_z,
    "VOLUME_RANK_X": volume_rank,
    "VOLUME_FORCE_X": volume_force,
    "VPIN_DIRECTIONAL_X": vpin_directional,
    "AMIHUD_ILLIQUIDITY_X": amihud_illiquidity,
    "VT_ACCELERATION_Z_X": vt_acceleration_z,
    
    #Volatilidad
    "VOLATILITY_RATIO": volatility_ratio,
    "VOLATILITY_COMPRESSION": volatility_compression,
    "YANG_ZHANG_X": yang_zhang_volatility,
    "CORWIN_SCHULTZ_Z_X": corwin_schultz_z,
    
    #Señales
    "MFF_Z_X": mff_z,
    "RGM_Z": rgm_z,
    "IDS_SHOCK": ids_shock,
    "WIN_RATE": win_rate,
}

#Si es True tiene opción de personalización por ventana si es False no
all_features = {
    # Miedo
    "FEAR_ENERGY_Z_X": True,
    "FEAR_DIFF_X": True,
    "FEAR_RANK_X": True,
    
    # Tendencia
    "DCP": False,
    "ADX_X": True,
    "ADX_ACCEL_X": True,
    "DIST_SMA_X": True,
    "KAUFMAN_ER": False,
    "HURST_X": True,
    "ROC": False,
    "DAY_RETURNS": False,
    
    # Volumen
    "RVOL_X": True,
    "RELATIVE_VOLUME_Z_X": True,
    "VOLUME_RANK_X": True,
    "VOLUME_FORCE_X": True,
    "VPIN_DIRECTIONAL_X": True,
    "AMIHUD_ILLIQUIDITY_X": True,
    "VT_ACCELERATION_Z_X": True,
    
    # Volatilidad
    "VOLATILITY_RATIO": False,
    "VOLATILITY_COMPRESSION": False,
    "YANG_ZHANG_X": True,
    "CORWIN_SCHULTZ_Z_X": True,
    
    # Señales
    "MFF_Z_X": True,
    "RGM_Z": False,
    "IDS_SHOCK": False,
    "WIN_RATE": False,
}