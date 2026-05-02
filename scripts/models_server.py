from fastapi import FastAPI, HTTPException
import uvicorn
from pydantic import BaseModel
from Features import all_features
from EventSampling import all_sampling_methods
from MLAlgorithms import all_models
from Targets import all_targets
from actions import train
from validation_utils import *

class ModelTrain(BaseModel):
    id: int
    ticker: str
    period: int
    objective: dict
    dataset: dict
    model_type: str
    hyperparameters: dict  = None
    optimize_hyperparameters: bool = False
    
    

class ModelPredict(BaseModel):
    pass

class FeatureSelectionInfo(BaseModel):
    ticker: str
    period: int
    objective: dict
    dataset: dict
    model_type: str
    sample_dataset: bool = False

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
    
    valid, reason = validateTicker(ticker)
    
    if not valid: raise HTTPException(status_code=400, detail=reason)
    
    return {"available": valid}

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
@app.post("/train")
def train_req(mt: ModelTrain):
    
    validations = (
        validateId(mt.id), 
        validateTicker(mt.ticker), 
        validatePeriod(mt.period),
        validateObjectiveDict(mt.objective), 
        validateModelType(mt.model_type),
        validateDatasetDict(mt.dataset), 
        validateHyperparameters(mt.hyperparameters)
    )
    
    for valid, reason in validations:
        
        if not valid: raise HTTPException(status_code=400, detail=reason)
    
    train_data = None
    try:
        train_data = train(
            stock=mt.ticker.upper().strip(),
            period=mt.period, dataset=mt.dataset,
            objective=mt.objective,
            model_type=mt.model_type,
            hyperparameters= mt.hyperparameters,
            id =mt.id,
            optimize_hyperparameters=mt.optimize_hyperparameters
            ) 
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Ha habido un error entrenando el modelo")
        
        
    return train_data

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