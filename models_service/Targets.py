import pandas as pd
import numpy as np

def nextDayPred(close):
    label = (close < close.shift(-1)).astype(int)
    label.iloc[-1] = None
    return label
    
def nextDaySignificant(close, threshold = 0.015):
    next_return = close.pct_change().shift(-1)
    label = (next_return > threshold).astype(int)
    label.iloc[-1] = None
    
    return label
    
    
def trendScanning(close, min_window = 5, max_window = 8, threshold = 1.5):
    
    #T_ stat np series to save computed t-stat
    t_stat = pd.Series(np.nan, index=close.index, dtype=float)
    
    for i in range(len(close) - max_window):
        max_t_stat = 0
        for j in range(i + min_window, i + max_window + 1):
            
            #Preparing window values to calculate the t stat for that size
            window_size = j - i
            window_close_values = close.iloc[i: j].values
            time = np.arange(window_size)
            
            #Prepares X data for the linear function
            X = np.vstack([time, np.ones(window_size)]).T
            
            #Least squares clalculates the slope of the regression
            #y = m*x + c
            m, c = np.linalg.lstsq(X, window_close_values, rcond=None)[0]
            
            #Ahora en vez de guardar el max slope, calculamos la "confianza" del slope con el error residual de esta linea, 
            #filtrando así el ruido de mercado buscando solo tendencias reales
            
            #Calculates the residual of the slope
            residual = window_close_values - (m * time + c)
            
            #How much degrees of freedom the window has
            freedom_degree = window_size - 2
            
            #Calculates residual variance based on freedom degrees
            residual_variance = np.sqrt(np.sum(residual**2)/ freedom_degree)
            
            #Calculated standard error based on time
            mean_time = np.mean(time)
            standard_error = residual_variance / np.sqrt(np.sum((time - mean_time)**2))
            
            #t_stat slope/ std_err
            curr_t_stat = m / standard_error if standard_error > 0 else 0
            
            if abs(curr_t_stat) > abs(max_t_stat):
                max_t_stat = curr_t_stat
        
        t_stat.iloc[i] = max_t_stat
    
    labels = pd.Series(np.nan, index = t_stat.index)
    labels[t_stat >= threshold] = 1
    labels[t_stat < -threshold] = 0
    
    return labels

def trendScanningShort(close):
    return trendScanning(close, min_window=3, max_window=4)

def trendScanningLong(close):
    return trendScanning(close, min_window=7, max_window=10)
 
target_methods = {
    "NextDay": nextDayPred,
    "NextDaySignificant": nextDaySignificant,
    "TrendScanningShort": trendScanningShort,
    "TrendScanningLong": trendScanningLong,
}

all_targets = [
    "NextDay",
    "NextDaySignificant",
    "TrendScanningLong",
    "TrendScanningShort"
    
]

target_explanations = {
    "NextDay": "Predice lo que va a pasar al dia siguiente 1 sube el precio, 0 baja",
    "NextDaySignificant": "Predice si el cambio de mañana va aser significante hacia arriba, 1 sube mas de 1.5% 0 no sube o baja",
    "TrendScanningLong": "Predice el slope maximo de una ventana de 7 a 10 dias, 1 slope positivo, 0 negativo o no suficiente",
    "TrendScanningShort": "Predice el slope maximo de una ventana de 3 a 4 dias, 1 slope positivo, 0 negativo o no suficiente"
}

def apply_target(df, target_type):
    df["TARGET"] = target_methods[target_type](df["Close"])