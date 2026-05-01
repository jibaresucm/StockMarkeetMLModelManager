from fastapi import FastAPI, HTTPException
import uvicorn
from pydantic import BaseModel
from Features import all_features
from EventSampling import all_sampling_methods
from MLAlgorithms import all_models
from Targets import all_targets
from actions import check_stock

class ModelTrain(BaseModel):
    pass

class ModelPredict(BaseModel):
    pass

class FeatureSelectionInfo(BaseModel):
    pass

app = FastAPI()

port = 10000

uvicorn.run("models_server:app", host="localhost", port=port, reload=True)

"""
    FUNCIONES DE ESTRUCTURA:
    
    Devuelven las opciones disponibles para cada entidad
    features, targets, event_sampling y model_types
"""


@app.get("/features")
def features():
    return {"features": all_features}

@app.get("/targets")
def targets():
    return {"targets": all_targets}

@app.get("/event_samplings")
def event_samplings():
    return {"sampling_methods": all_sampling_methods}

@app.get("/model_types")
def model_types():
    return {"models" : all_models}

"""
    FUNCION DE CHECK_STOCK
    
    Comprueba si un ticker está disponible en yfinance
"""


@app.get("/check_stock/{ticker}")
def check_ticker_req(ticker : str):
    ticker = ticker.upper().strip()
    available = check_stock(ticker)
    if not available :
        raise HTTPException(status_code=400, detail="Ticker is not available")
    
    return {"available": available}

"""
    FUNCION DE TRAIN
        -Requiere id (Para guardar)
        -Requiere ticker
        -Requiere period
        -Requiere objective
        -Requiere dataset
        -Requiere tipo de modelo
        -Hyperparametros opcionales
        -Si optimize_hyperparameters se optimizan solos
"""
@app.get("/train/{optimize_hyperparameters}")
def train_req(optimize_hyperparameters : int):
    pass

"""
    FUNCION DE PREDICT
        -Requiere id (Para cargar)
        -Requiere ticker
        -Requiere objective
        -Requiere dataset
"""
@app.get("/predict")
def predict_req():
    pass

"""
    FUNCIONES DE FEATURE ANALYSIS:
        -Requieren ticker
        -Requieren period
        -Requieren objective
        -Requieren dataset si el sample_dataset es False
        -sample_dataset si True utiliza el sample_dataset si no ggs
"""

@app.get("/mutual_information")
def mutual_information_req():
    pass

@app.get("/best_groups")
def best_groups_req():
    pass

@app.get("rfe_importance")
def rfe_importance_req():
    pass

@app.get("correlation_matrix")
def correlation_matrix_req():
    pass

@app.get("/feature_label_analysis")
def feature_label_analysis_req():
    pass

@app.get("/cluster_analysis")
def cluster_analysis_req():
    pass