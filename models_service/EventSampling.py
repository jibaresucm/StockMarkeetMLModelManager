import pandas as pd

def rvol_sampling(df, threshold = 1.25):
    rvol_window = 10
    volume = df["Volume"]
    
    vol_mean = volume.rolling(window=rvol_window).mean()
    rvol = volume / vol_mean - 1
    
    rvol_mean = rvol.rolling(window=rvol_window).mean()
    rvol_std = rvol.rolling(window=rvol_window).std()
    
    rvol_z = (rvol - rvol_mean) / rvol_std
    mask = (rvol_z > threshold)

    return mask

def cumsum_sampling(df, threshold = 0.03):
    s_pos = 0
    s_neg = 0
    
    diff = df["Close"].pct_change()
    mask = pd.Series(False, index=df["Close"].index)
    
    for i in range(1, len(diff)):
        val = diff.iloc[i]
        if pd.isna(val):
            continue
            
        s_pos = max(0, s_pos + val)
        s_neg = min(0, s_neg + val)
        
        if s_pos > threshold:
            mask.iloc[i] = True
            s_pos = 0
            s_neg = 0
        elif s_neg < -threshold:
            mask.iloc[i] = True
            s_pos = 0
            s_neg = 0
            
    return mask
    
sampling_methods = {
    "RVOL_Z_SAMPLING": rvol_sampling,
    "CUMSUM_SAMPLING": cumsum_sampling
}

all_sampling_methods = [
    "None",
    "RVOL_Z_SAMPLING",
    "CUMSUM_SAMPLING"
]

sampling_explanations = {
    "None":
        "Se genera una predicción para todos los días de mercado sin aplicar ningún filtro.",

    "RVOL_Z_SAMPLING":
        "Solo se generan predicciones en aquellos días en los que el volumen relativo es significativamente superior al habitual, filtrando periodos de baja actividad.",
    "CUMSUM_SAMPLING":
        "Filtra los samples segun la informacion del mercado, cuando el mercado se mueve un determinado threshold porcentual en una dirección ese dia se guarda como evento"
}

def apply_event_sampling(df, sampling_type):
    if(sampling_type not in sampling_methods.keys()):
        return df
    
    mask = sampling_methods[sampling_type](df)

    df = df[mask].copy()
    
    return df