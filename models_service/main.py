import sys
import ast
from Datasets import cleanDatasetDict, featureListToDatasetDict, getSampleDataset
from MLAlgorithms import validModelDict
import argparse

from actions import predict, train, check_stock, mutual_information, best_groups, rfe_importance, correlation_matrix, feature_label_analysis, cluster_analysis

#Este es el script principal, recibe inline arguments al ser ejecutado
#Primero un string que defina la acción train/ predict
#Un dictionary con la descripción completa del modelo, STOCK, PERIOD, TICKER, HYPERPARAMETERS etc..
#Otro con el dataset, con todas las features q existen o quieres que lleve el modelo
#El feature dict tiene todos las posibles features con True o False para saber si se utilizan en el modelo 
# y una lista para los last_X o False para saber en q rwindows se deberían calcular esas features si se calculan

parser = argparse.ArgumentParser(description='Modulo de gestión, entrenamiento y predicción con modelos de ML. Permite optimización de features e hyperparámetros automáticamente')

parser.add_argument("action", choices=["train", "predict", "check_stock", "mutual_information", "best_groups", "rfe_importance", "correlation_matrix", "feature_label_analysis", "cluster_analysis"])#Recoge string de accion (obligatorio)
parser.add_argument("-m", "--model", required=True)#Recoge string de model_desc (obligatorio)
parser.add_argument("-o", "--objective", required=True, default= r"{}")#Recoge string de model_desc (obligatorio)
parser.add_argument("-d", "--dataset", default=r"{}") #Recoge string de dict de dataset (con las features)
parser.add_argument("--optimize-hyperparameters", action="store_true", help="Habilita la optimización de hyperparámetros usando un algoritmo de grid search")
parser.add_argument("--sample-dataset", action="store_true", help="Utiliza es sample dataset")

require_dataset_action = ["train", "predict", "mutual_information", "best_groups", "rfe_importance", "correlation_matrix", "feature_label_analysis", "cluster_analysis"]

args = parser.parse_args()

action = args.action
model_desc = args.model
dataset = args.dataset
objective = args.objective
optimize_hyperparameters = args.optimize_hyperparameters
sample_dataset = args.sample_dataset

print(args)

try:
    model_desc = ast.literal_eval(model_desc)
    dataset = ast.literal_eval(dataset)
    objective = ast.literal_eval(objective)
    cleanDatasetDict(dataset)
except Exception as e:
    sys.stderr.write("Please provide valid dictionaries for the model description and the dataset")
    sys.exit(1)


model_desc ={'ID': 14, 'STOCK': 'AMZN', 'PERIOD': 1000, 'MODEL_TYPE': 'RandomForestClassifier', 'HYPERPARAMETERS': {}}
dataset = featureListToDatasetDict(eval("['FEAR_RANK_100', 'VPIN_DIRECTIONAL_20', 'ADX_5', 'DCP']"))
objective = {"TARGET": "TrendScanningLong", "SAMPLING": "CUMSUM_SAMPLING"}

if(action == "train" and not sample_dataset and dataset == {}):
    sys.stderr.write("Please provide the features to train the model or just select full dataset")
    sys.exit(1)

if(action == "predict" and dataset == {}):
    sys.stderr.write("Please provide the features that were used to train the model")
    sys.exit(1)

if(not validModelDict(model_desc)):
    sys.stderr.write("Please provide a valid model dictionary")
    sys.exit(1)

id = model_desc["ID"]
stock = model_desc["STOCK"]
period = model_desc["PERIOD"]
model_type = model_desc["MODEL_TYPE"]
hyperparams = model_desc["HYPERPARAMETERS"]

if sample_dataset: #Se define si se usa todas las features del dataset
        dataset = getSampleDataset()
        
try:
    
    match (action):
        case "train":
            train(stock=stock, period=period, dataset=dataset, objective=objective ,model_type=model_type, hyperparameters=hyperparams, id=id, optimize_hyperparameters=optimize_hyperparameters)
        case "predict":
            predict(stock=stock, dataset=dataset, id=id, objective=objective)
        case "check_stock":
            check_stock(stock=stock)
        case "mutual_information":
            mutual_information(dataset=dataset, stock=stock, period=period, objective=objective)
        case "best_groups":
            best_groups(dataset=dataset, stock=stock, period=period, objective=objective)
        case "rfe_importance":
            rfe_importance(dataset=dataset, stock=stock, period=period, objective=objective)
        case "correlation_matrix":
            correlation_matrix(dataset=dataset, stock=stock, period=period, objective=objective)
        case "feature_label_analysis":
            feature_label_analysis(dataset=dataset, stock=stock, period=period, objective=objective)
        case "cluster_analysis":
            cluster_analysis(dataset=dataset, stock=stock, period=period, objective=objective)
        
except Exception as e:
    raise e
    sys.stderr.write("An exception has occurred please verify the data of the provided arguments")
    sys.exit(1)