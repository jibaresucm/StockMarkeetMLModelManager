import os
from pathlib import Path
import pickle

save_folder = Path(__file__).resolve().parent/ ".." / "model_files"

def loadModel(id):
    
    with open(save_folder / f"model_{id}.pkl", "rb") as f:
        model = pickle.load(f)
    
        
    return model

def saveModel(id, model):
    
    with open(save_folder / f"model_{id}.pkl", "wb") as f:
        pickle.dump(model, f)
        f.flush()               # Vacía el búfer interno de Python
        os.fsync(f.fileno())    # Obliga al Sistema Operativo a escribir en el disco duro
    
    
    return