import numpy as np
import pandas as pd

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
    
    rolling_z = 40
    
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

def vt_acceleration_z(df, window_acc=5, window_z=20):
    """
    Calcula el Z-Score de la aceleración del Price Volume Trend.
    Detecta anomalías en la fuerza del movimiento.
    """
    pvt = (df['Volume'] * df['Close'].pct_change()).cumsum()
    
    pvt_acc = pvt.diff(periods=window_acc)
    
    rolling_mean = pvt_acc.rolling(window=window_z).mean()
    rolling_std = pvt_acc.rolling(window=window_z).std()
    
    pvt_z = (pvt_acc - rolling_mean) / rolling_std
    
    return pvt_z