from fastapi import FastAPI, HTTPException, Body
import uvicorn
from pydantic import BaseModel
from Features import all_features
from EventSampling import all_sampling_methods, sampling_explanations
from MLAlgorithms import all_models
from Targets import all_targets, target_explanations
from Datasets import getSampleDataset
from actions import train, predict, mutual_information, best_groups, rfe_importance, correlation_matrix, feature_label_analysis, cluster_analysis
from validation_utils import *
from ModelPersistance import loadModel
import traceback
from ollama import Client
from settings import Settings

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
    id: int
    ticker: str
    model_type: str
    objective: dict
    dataset: dict
    

    
class ReportModel(BaseModel):
    id: int
    ticker: str
    model_type: str
    objective: dict
    dataset: dict
    
class ProjectReport(BaseModel):

    project_name: str

    project_description: str

    models: list[ReportModel]

class FeatureSelectionInfo(BaseModel):
    ticker: str
    period: int
    objective: dict
    dataset: dict = None
    sample_dataset: bool = False

app = FastAPI()
client =   Client(host=f"http://{Settings.OLLAMA_HOST}:{Settings.OLLAMA_PORT}")

port = 7777

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
        print(train_data)
        return {"data": train_data}
    except Exception as e:
        print(e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ha habido un error entrenando el modelo")
        


"""
    FUNCION DE PREDICT
        -Requiere id (Para cargar)
        -Requiere ticker
        -Requiere objective
        -Requiere dataset
"""
@app.post("/predict")
def predict_req(mp: ModelPredict):
    validations = (
        validateId(mp.id), 
        validateTicker(mp.ticker), 
        validateObjectiveDict(mp.objective), 
        validateDatasetDict(mp.dataset)
    )
    
    for valid, reason in validations:
        if not valid: raise HTTPException(status_code=400, detail=reason)
    
    try:
        prediction_data = predict(
            stock=mp.ticker.upper().strip(),
            dataset=mp.dataset,
            objective=mp.objective,
            id = mp.id
        )
        
        print(prediction_data)
        return {"data": prediction_data}
    except Exception as e:
        print(e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ha habido un error realizando la predicción")
    



"""
    FUNCIONES DE FEATURE ANALYSIS:
        -Requieren ticker
        -Requieren period
        -Requieren objective
        -Requieren dataset si el sample_dataset es False
        -sample_dataset si True utiliza el sample_dataset si no ggs
"""

def feature_selection_logic(fun: callable, fsi: FeatureSelectionInfo):
    validations = (
        validateFSDatasetLogic(fsi.dataset, fsi.sample_dataset),
        validateTicker(fsi.ticker), 
        validateObjectiveDict(fsi.objective),
        validatePeriod(fsi.period)
    )
    
    for valid, reason in validations:
        if not valid: raise HTTPException(status_code=400, detail=reason)
       
    try:
        dataset = getSampleDataset() if fsi.sample_dataset else fsi.dataset
            
        data = fun(
            dataset=dataset,
            stock=fsi.ticker.upper().strip(),
            period=fsi.period,
            objective=fsi.objective
            )
        
        if data is None:
            raise Exception()
        
        return {"data": data}
    except Exception as e:
        print(e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ha habido un error realizando el analisis")
    


@app.get("/mutual_information")
def mutual_information_req(fsi: FeatureSelectionInfo):
    return feature_selection_logic(mutual_information, fsi)

@app.get("/best_groups")
def best_groups_req(fsi: FeatureSelectionInfo):
    return feature_selection_logic(best_groups, fsi)

@app.get("/rfe_importance")
def rfe_importance_req(fsi: FeatureSelectionInfo):
    return feature_selection_logic(rfe_importance, fsi)

@app.get("/correlation_matrix")
def correlation_matrix_req(fsi: FeatureSelectionInfo):
    return feature_selection_logic(correlation_matrix, fsi)

@app.get("/feature_label_analysis")
def feature_label_analysis_req(fsi: FeatureSelectionInfo):
    return feature_selection_logic(feature_label_analysis, fsi)

@app.get("/cluster_analysis")
def cluster_analysis_req(fsi: FeatureSelectionInfo):
    return feature_selection_logic(cluster_analysis, fsi)


"""
    FUNCION DE REPORTES
        -Requiere lista de modelos
            -Cada modelo requiere id, objective y dataset
    
    Genera un reporte con las predicciones del modelo
"""

#OLLAMA_HOST = "localhost"
#OLLAMA_PORT = 11434
def generate_analysis(report):

    prompt = f"""
    Nombre del proyecto:
    {report["project"]["name"]}

    Descripción del proyecto:
    {report["project"]["description"]}

    """
    
    for model in report["models"]:

        prompt += f"""

    ----------------------------------------

    Ticker:
    {model["ticker"]}

    Modelo:
    {model["model"]}

    Target:
    {model["target"]}

    Sampling:
    {model["sampling"]}

    Predicción:
    {model["prediction"]}

    Confianza:
    {model["confidence"]:.2f} %

    Accuracy:
    {model["accuracy"]:.2f}

    Precision SUBE:
    {model["precision_up"]:.2f}

    Precision BAJA:
    {model["precision_down"]:.2f}

    Recall SUBE:
    {model["recall_up"]:.2f}

    Recall BAJA:
    {model["recall_down"]:.2f}

    Matriz de confusión:
    {model["confusion_matrix"]}

    """
    
    prompt += """
    Realiza un análisis global del proyecto.

    Ten en cuenta:

    - El nombre del proyecto.
    - La descripción del proyecto.
    - Las predicciones de todos los modelos.
    - Las métricas de cada modelo.
    - El nivel de confianza de cada predicción.

    Explica:

    1. Qué intenta conseguir este proyecto.

    2. Si existe consenso entre los modelos.

    3. Si predominan señales alcistas o bajistas.

    4. Qué indican las métricas de los modelos.

    5. Si existen modelos significativamente más fiables que otros.

    6. Haz un resumen ejecutivo del estado general del proyecto.

    No inventes datos.

    No des recomendaciones de compra o venta.

    No utilices información externa.

    El análisis debe ser profesional y de aproximadamente 250 palabras.
    """
    
    response = client.chat(
    model=Settings.OLLAMA_MODEL,
    messages=[
        {
            "role": "system",
            "content": "Eres un analista financiero experto en Machine Learning."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]
    )

    return response["message"]["content"]

# @app.post("/generate_report")
# def generate_report(models: list[ModelPredict] = Body(...)):
#     print("=== GENERATE REPORT ===")
#     print(models)
#     for mp in models:
#         validations = (
#                 validateId(mp.id), 
#                 validateTicker(mp.ticker), 
#                 validateObjectiveDict(mp.objective), 
#                 validateDatasetDict(mp.dataset)
#             )
        
#         for valid, reason in validations:
#                 if not valid: raise HTTPException(status_code=400, detail=reason)
                
#     predictions = []
#     for mp in models:
#         try:
#             prediction_data = predict(
#                 stock=mp.ticker.upper().strip(),
#                 dataset=mp.dataset,
#                 objective=mp.objective,
#                 id = mp.id
#             )
            
#             predictions.append(prediction_data)
#         except Exception as e:
#             print(e)
#             traceback.print_exc()
#             raise HTTPException(status_code=500, detail="Ha habido un error realizando la predicción")
            
#     report = []

#     print(predictions)
#     return predictions

@app.post("/generate_report")
def generate_report(report: ProjectReport):

    response = {

        "project": {
            "name": report.project_name,
            "description": report.project_description
        },

        "target_descriptions": {},

        "sampling_descriptions": {},

        "models": [],

        "global_analysis": None
    }

    used_targets = set()
    used_sampling = set()

    for model in report.models:
        validations = (
            validateId(model.id),
            validateTicker(model.ticker),
            validateObjectiveDict(model.objective),
            validateDatasetDict(model.dataset),
            validateModelType(model.model_type)
        )

        for valid, reason in validations:
            if not valid:
                raise HTTPException(status_code=400, detail=reason)
            
        prediction = predict(
            stock=model.ticker,
            dataset=model.dataset,
            objective=model.objective,
            id=model.id
        )

        print(prediction)
        saved_model = loadModel(model.id)

        stats = saved_model["stats"]
        
        prediction_text = (
            "SUBE"
            if int(prediction["prediction"]) == 1
            else "BAJA"
        )

        used_targets.add(model.objective["TARGET"])
        used_sampling.add(model.objective["SAMPLING"])

        model_info = {

            "id": model.id,
            "ticker": model.ticker,
            "model": model.model_type,

            "target": model.objective["TARGET"],
            "sampling": model.objective["SAMPLING"],

            "accuracy": stats["accuracy"],
            "precision_up": stats["precision_up"],
            "precision_down": stats["precision_down"],
            "recall_up": stats["recall_up"],
            "recall_down": stats["recall_down"],
            "confusion_matrix": stats["confusion_matrix"].tolist(),

            "prediction": prediction_text,
            "confidence": prediction["confidence"],
            "date": prediction["date"]
        }

        response["models"].append(model_info)

    for target in used_targets:
        response["target_descriptions"][target] = target_explanations[target]

    for sampling in used_sampling:
        response["sampling_descriptions"][sampling] = sampling_explanations[sampling]

    response["global_analysis"] = generate_analysis(response)
    
    return response
    
"""
Explicaciones Event Sampling:
None: Todos los dias de mercado se realiza una prediccion
RVOL_Z_SAMPLING: Solo los dias de mayor volumen relativo al pasado se realiza una prediccion
"""


"""
Nombre modelo 
Target: NextDay
EventSampling: None
Accuracy Recall
"""


#Recibe los metadatos del proyecto al que se le va a hacer el reporte
#Analizar individualmente cada modelo, y explicarlo
#Explicar la direccion general del mercado si es posible, segun los modelos
#Dar recomendaciones de inversion segun las predicciones

if __name__ == "__main__":
    uvicorn.run("models_server:app", host="0.0.0.0", port=port, reload=True)