import pandas as pd
import numpy as np

def nextDayPred(close):
    label = (close < close.shift(-1)).astype(int)
    label.iloc[-1] = None
    return label

def nextDayPredSignificant(close, threshold = 0.015):
    diff = (close.shift(-1) - close) / close
    label = pd.Series(0, index=close.index)
    
    label[diff > threshold] = 1
    label[diff < -threshold] = -1
    
    label.iloc[-1] = None
    
    return label
    
def trendScanning(close, min_window = 5, max_window = 10, threshold = 3.0):
    
    #Guardamos el valor de "Confianza" de subida
    t_stat = pd.Series(np.nan, index=close.index, dtype=float)
    
    for i in range(len(close) - max_window):
        max_t_stat = 0
        for j in range(i + min_window, i + max_window + 1):
            
            #Preparamos la X y la Y de la regresión lineal
            window_size = j - i
            window_close_values = close.iloc[i: j].values
            time = np.arange(window_size)
            
            #La función linear
            X = np.vstack([time, np.ones(window_size)]).T
            
            #Least squaress, menor disancia cuadrada, encuentra el slope y el intercept recibe datos en forma de [[0,1], [1, 1] ...]
            #Siendo [Tiempo, 1] pasamos ese 1 porq se va amultiplicar por el intercept, haciendo que el precio empiece por elp recio real y no por 0
            #y = m*x + c
            m, c = np.linalg.lstsq(X, window_close_values, rcond=None)[0]
            
            #Ahora en vez de guardar el max slope, calculamos la "confianza" del slope con el error residual de esta linea, 
            #filtrando así el ruido de mercado buscando solo tendencias reales
            
            #Calcula distancia de cada piunto a la linea
            residual = window_close_values - (m * time + c)
            
            #Cuanta libertad tiene la pendiente, ya hemos calculado m y c por eso el -2, cuantos más días tenga la window más real es la tendencia, menos ruido
            freedom_degree = window_size - 2
            
            #Calcula que tan lejos están los residuos ajustando por sus grados de libertad
            residual_variance = np.sqrt(np.sum(residual**2)/ freedom_degree)
            
            #Relaciona el ruido con la fuerza del tiempo
            mean_time = np.mean(time)
            standard_error = residual_variance / np.sqrt(np.sum((time - mean_time)**2))
            
            #Calculamos el t_stat que es m/ standard error
            curr_t_stat = m / standard_error if standard_error > 0 else 0
            
            if abs(curr_t_stat) > abs(max_t_stat):
                max_t_stat = curr_t_stat
        
        t_stat.iloc[i] = max_t_stat
    
    labels = pd.Series(np.nan, index = t_stat.index)
    labels[t_stat.notna()] = 0
    labels[t_stat >= threshold] = 1
    labels[t_stat <= -threshold] = -1
    
    return labels

target_methods = {
    "NextDay": nextDayPred,
    "NextDaySignificant": nextDayPredSignificant,
    "TrendScanning": trendScanning,
}

all_targets = [
    "NextDay",
    "NextDaySignificant",
    "TrendScanning"
]

def apply_target(df, target_type):
    df["TARGET"] = target_methods[target_type](df["Close"])