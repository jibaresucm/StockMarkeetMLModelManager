import sys
import ast
from Datasets import cleanFeaturesDict, featureListToFeatureDict, generateTrainingDataset, generateLastDayForPrediction, getFullDatasetDict, checkForStock
from FeatureSelection import autoFeatureSelectionGEN, manualFeatureSelection
from HyperparameterOptimization import autoHyperparameterSelection
from ModelCreation import validModelDict
from ModelSaving import loadModel, saveModel
import argparse

from ModelTrainPredict import predict, trainAndSave

#Este es el script principal, recibe inline arguments al ser ejecutado
#Primero un string que defina la acción train/ predict
#Un dictionary con la descripción completa del modelo, STOCK, PERIOD, MAX_WINDOW, TICKER, HYPERPARAMETERS, OPTIMIZE_HYPERP etc..
#Otro con el dataset, con todas las features q existen o quieres que lleve el modelo
#El feature dict tiene todos las posibles features con True o False para saber si se utilizan en el modelo 
# y una lista para los last_X o False para saber en q rwindows se deberían calcular esas features si se calculan

parser = argparse.ArgumentParser(description='Modulo de gestión, entrenamiento y predicción con modelos de ML. Permite optimización de features e hyperparámetros automáticamente')

parser.add_argument("-a", "--action", required=True, choices=["train", "predict", "feature_selection"])#Recoge string de accion (obligatorio)
parser.add_argument("-m", "--model", required=True)#Recoge string de modelDescDict (obligatorio)
parser.add_argument("-f", "--features", default=r"{}") #Recoge string de featureDict
parser.add_argument("--optimize-features", action="store_true", help="Habilita la optimización de features usando un algoritmo de selección genético")
parser.add_argument("--optimize-hyperparameters", action="store_true", help="Habilita la optimización de hyperparámetros usando un algoritmo de grid search")
parser.add_argument("--full-dataset", action="store_true", help="Habilita la optimización de hyperparámetros usando un algoritmo de grid search")

args = parser.parse_args()

action = args.action
modelDescDict = args.model
featuresDict = args.features
optimize_features = args.optimize_features
optimize_hyperparameters = args.optimize_hyperparameters
full_dataset = args.full_dataset

print(args)

try:
    modelDescDict = ast.literal_eval(modelDescDict)
    featuresDict = ast.literal_eval(featuresDict)
    cleanFeaturesDict(featuresDict)
except Exception as e:
    sys.stderr.write("Please provide valid dictionaries for the model description and the features")
    sys.exit(1)


modelDescDict ={'ID': 14, 'STOCK': 'AAPL', 'PERIOD': 500, 'MODEL_TYPE': 'RandomForestClassifier', 'HYPERPARAMETERS': {}}
featuresDict = featureListToFeatureDict(eval("['ADX_ACCEL_10', 'DCP', 'DIST_SMA_20', 'FEAR_ENERGY_Z_3', 'VOLUME_FORCE_20', 'VOLATILITY_RATIO', 'RGM_Z']"))

if(action == "train" and not full_dataset and featuresDict == {}):
    sys.stderr.write("Please provide the features to train the model or just select full dataset")
    sys.exit(1)

if(action == "predict" and featuresDict == {}):
    sys.stderr.write("Please provide the features that were used to train the model")
    sys.exit(1)

if(not validModelDict(modelDescDict)):
    sys.stderr.write("Please provide a valid model dictionary")
    sys.exit(1)





try:
    
    if(action == "train"):
        
        id = modelDescDict["ID"]
        stock = modelDescDict["STOCK"]
        period = modelDescDict["PERIOD"]
        model_type = modelDescDict["MODEL_TYPE"]
        hyperparams = modelDescDict["HYPERPARAMETERS"]
        
        #Dataset Generation
        if full_dataset: #Se define si se usa todas las features del dataset
            featuresDict = getFullDatasetDict()
            
        if optimize_features:#Se optimiza sobre current featureDict
            featuresDict = autoFeatureSelectionGEN(generateTrainingDataset(stock, period, featuresDict), model_type, hyperparams=hyperparams)


        df = generateTrainingDataset(stock, period, featuresDict)
        
        if optimize_hyperparameters:
            modelData = autoHyperparameterSelection(df, model_type)
        else:
            modelData = trainAndSave(df, model_type, hyperparams)
        
        print(featuresDict)
        saveModel(id, modelData["MODEL"])
        
    elif(action == "predict"):
        stock = modelDescDict["STOCK"]
        max_window = modelDescDict["MAX_WINDOW"]
        id = modelDescDict["ID"]
        
        df = generateLastDayForPrediction(stock, max_window, featuresDict)
        
        prediction = predict(df, id)
        
    elif(action == "feature_selection"):
        stock = modelDescDict["STOCK"]
        period = modelDescDict["PERIOD"]
        model_type = modelDescDict["MODEL_TYPE"]
        hyperparams = modelDescDict["HYPERPARAMETERS"]
        
        if full_dataset: #Se define si se usa todas las features del dataset
            featuresDict = getFullDatasetDict()
            
        df = generateTrainingDataset(stock, period, featuresDict)
        
        manualFeatureSelection(df, model_type, hyperparams)
except Exception as e:
    sys.stderr.write("An exception has occurred please verify the data of the provided arguments: " + str(e))
    sys.exit(1)