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


sampling_methods = {
    "RVOL_Z_SAMPLING": rvol_sampling,
}

all_sampling_methods = [
    "RVOL_Z_SAMPLING",
]

def apply_event_sampling(df, sampling_type):
    if(sampling_type not in sampling_methods.keys()):
        return df
    
    mask = sampling_methods[sampling_type](df)

    df = df[mask].copy()
    
    return df