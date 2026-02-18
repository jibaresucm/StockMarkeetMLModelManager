from DatasetUtils import generateTrainingDataset, generateLastDayForPrediction,checkForStock
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
import pickle
from pathlib import Path
import os

save_folder = Path(__file__).resolve().parent/ ".." / "model_files"

def trainAndSave(id, featuresDict, modelDescDict):
    
    stock = modelDescDict["STOCK"]
    if(not checkForStock(stock)): return 
    
    period = modelDescDict["PERIOD"]
    
    _cleanFeaturesDict(featuresDict)
    
    df = generateTrainingDataset(stock, period, featuresDict)
    
    #split test_train
    #Como analizamos mercado no podemos hacerlo cogiendo días randomizados sino en timeframes (series)
    
    train_size = int(len(df) * 0.8)

    train = df.iloc[:train_size]
    test = df.iloc[train_size:]

    X_train = train.drop("TARGET", axis = 1)
    y_train = train['TARGET']

    X_test = test.drop("TARGET", axis = 1)
    y_test = test['TARGET']
    
    #fit_transform
    scaler = StandardScaler()
        
    X_train = scaler.fit_transform(X_train)
    
    X_test = scaler.transform(X_test)

    #Create model
    #model = _createModel(modelDescDict["MODEL"], modelDescDict["HYPERPARAMETERS"])
    
    model = RandomForestClassifier(
    n_estimators=100,      # Número de árboles. 100 es un buen equilibrio.
    max_depth=5,           # ¡Ojo aquí! Poca profundidad evita que el modelo memorice ruido.
    min_samples_leaf=50,   # Mínimo de días necesarios para crear una "regla".
    max_features='sqrt',   # Cuántas columnas mira cada árbol (raíz cuadrada del total).
    bootstrap=True,        # Entrena cada árbol con una muestra aleatoria.
    n_jobs=-1,             # Usa todos los núcleos de tu procesador (más rápido).
    random_state=42        # Para que los resultados sean reproducibles.
    )
    
    #Train model
    model.fit(X_train, y_train)
    
    #Generate scores TODO
    
    with open(save_folder / f"model_{id}.pkl", "wb") as f:
        pickle.dump(model, f)
        f.flush()               # Vacía el búfer interno de Python
        os.fsync(f.fileno())    # Obliga al Sistema Operativo a escribir en el disco duro
    
    with open(save_folder / f"scaler_{id}.pkl", "wb") as f:
        pickle.dump(scaler, f)

    

    
def loadAndPredict(id, featuresDict, modelDescDict):
    stock = modelDescDict["STOCK"]
    stock = "AMZN"
    if(not checkForStock(stock)): return 
    
    period = modelDescDict["MAX_WINDOW"]
    maxWindow = "20d"
    _cleanFeaturesDict(featuresDict)
    df = generateLastDayForPrediction(stock, maxWindow, featuresDict)
    
    with open(save_folder / f"model_{id}.pkl", "rb") as f:
        model = pickle.load(f)
    
    with open(save_folder / f"scaler_{id}.pkl", "rb") as f:
        scaler = pickle.load(f)
    
    df = df.iloc[-1]
    df = df.values.reshape(1, -1)
    
    df = scaler.transform(df)
    
    pred = model.predict(df)
    pred_proba = model.predict_proba(df)
    
    umbral = 0.53
    preds_con_umbral = (pred_proba >= umbral).astype(int)
    
    print(pred)
    print(pred_proba)#[Prob de q sea 0, prob de q sea 1]
    print(preds_con_umbral)
    
    
def _cleanFeaturesDict(featuresDict):
    for indicator in list(featuresDict.keys()):
        if(featuresDict[indicator] <= 0): del featuresDict[indicator]
        
def _createModel(modelString, hyperParametersDict):
    pass

loadAndPredict(0, {"RVOL_WITH_LAST_X": 14, "VOLATILITY_PARK_LAST_X": 14, "RSI_PCT": 1, "RSI": 1, "DISTANCE_TO_SMA_X": 14, "CPR": 1, "FEAR_IDX":1}, {})