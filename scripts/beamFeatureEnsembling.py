from BeamSearch import BeamSearch
from Datasets import generateTrainingDataset, checkForStock
import pickle
import sys

tickers = [
    # --- GRUPO 1: Los Gigantes (High Beta / Tech) ---
    "AAPL", "AMZN", "MSFT", "NVDA", "TSLA", "META", "GOOGL", "AMD", "NFLX", "CRM",
    
    # --- GRUPO 2: Infraestructura, Chipsets y Finanzas ---
    "AVGO", "ADBE", "INTC", "PYPL", "V", "MA", "QCOM", "TXN", "ASML", "JPM",
    
    # --- GRUPO 3: Consumo, Salud y Energía (Estabilidad) ---
    "COST", "WMT", "DIS", "NKE", "PFE", "UNH", "KO", "PEP", "XOM", "BA"
]

for elem in tickers:
    if not checkForStock(elem):
        print(f"Ticker {elem} not valid!!!")
        sys.exit(1)

features_dict = {
        #Miedo
        "FEAR_ENERGY_Z_X": [3, 10],#ABS DIFF SUM de unos 3 a 7 días, normalizada en ventana de X, indica cambios (energia) del miedo
        "FEAR_DIFF_X": [7, 20], #DIFF EMA de ventana X, indica dirección del miedo
        "FEAR_RANK_X": [30, 100], #Rango en porcentaje, indica el valor del miedo respecto a ultimos días
        
        #Tendencia
        "DCP_X":[10], #Media exponencial del dcp ultimos 3 a cuatro dias, DCP calculado con window X
        "ADX_ACCEL_X": [10, 20], #Aceleración de fuerza (en cualquier dirección), indica si el mercado está reforzando la tendencia
        "DIST_SMA_X": [20, 80, 120], #Distancia actual del sma al close, sma de una window X. Indica tendencia general
        
        #Volumen
        "RELATIVE_VOLUME_Z_X": [7, 20], #Volumen relativo a la ema de los ultimos x dias, normalizado ventana z 3, indica tendencia en volumen y rareza del valor en mercado actual
        "VOLUME_RANK_X": [20, 80], #Rank ultimos X días
        "VOLUME_FORCE_X": [20, 40], #Indica la dirección y la validez de esta en el mercado (filtra ruido), Retornos/ rvol de window x
        
        #Volatilidad
        "VOLATILITY_RATIO": True, #Compresión de la volatilidad, ATR3 o 4 / ATR20, demuestra cambios bruscos en la volatilidad
        "VOLATILITY_COMPRESSION": True, # SMA5 / SMAMAX100
        
        #Señales
        "RGM_Z": True, #Relative gap momentum, indica si el relativa gap ha seguido con fuerzas, indica aceleración en el gap
        "Daily_Efficiency": True, #Se aplica EMA de 3 dias
        "IDS_SHOCK": True, #Si el mercado está paradillo y no sobrepasa ni high noi low anterior, junto con volumen explica el estado del mercado
        "WIN_RATE_Z": True #Win ratio de los ultimos dias indica tendencia y ayuda aver si está acabada
}

dataset_version = 1

period = 500

beam_size = 10
max_group_size = 3

counts = []

for n in range(2, max_group_size + 1):
    counts.append({})
for ticker in tickers:
    
    print(f"Starting beam search for {ticker}")
    df = generateTrainingDataset(ticker, period, features_dict)
    best_groups_by_size = BeamSearch(df, max_group_size, beam_size)
    
    for group_size, dict_list in best_groups_by_size.items():
        if group_size == 1:
            continue
        
        g_idx = group_size - 2
        for combination in dict_list:
            if combination["features"] in counts[g_idx]:
                counts[g_idx][combination["features"]] += 1
            else:
               counts[g_idx][combination["features"]] = 1 

    print(f"Ended beam search for {ticker}")
    
print(counts)

group_size = 2
for frequencies in counts:
    counts_list = list(frequencies.items())
    counts_list = sorted(counts_list, key= lambda x: x[1], reverse=True)

    print(f"\nCombinaciones más comunes para tamaño: {group_size}")
    print(counts_list[:10])

               