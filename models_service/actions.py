from Datasets import generateTrainingDataset, generateLastPredictionRow, checkForStock
from Training_Prediction import autoHyperparameterSelection, train_model, predict_row
from ModelPersistance import saveModel, loadModel
from FeatureSelection import mutualInformation, BeamSearch, recursiveFeatureElimination, correlationMatrix, featureLabelAnalysis, clusterAnalysis
from DataSplit import split_train_test
import numpy as np

def train(stock, period, dataset, objective, model_type, hyperparameters, id, optimize_hyperparameters):
    df = generateTrainingDataset(stock, period, dataset, objective)
    train, test = split_train_test(df)
    
    if optimize_hyperparameters:
        modelData = autoHyperparameterSelection(train, test, model_type)
    else:
        modelData = train_model(train, test, model_type, hyperparameters)
    
    trained_model = modelData["MODEL"]
    model_statistics = modelData["STATS"]
    
    saveModel(id, model=trained_model,stats=model_statistics)
    
    ret = {}
    for key, val in model_statistics.items():
        if isinstance(val, np.ndarray):
            ret[key] = np.array2string(val, separator=", ").replace("\n", "")
        else:
            ret[key] = val
        #ret[key] = np.array2string(val, separator=", ").replace("\n", "")
    
    return ret
     
# def predict(stock, dataset, objective, id):
    
#     row_data = generateLastPredictionRow(stock, dataset, objective)
#     row_date = row_data["date"]
#     row = row_data["data"]
    
#     model = loadModel(id)
#     prediction = predict_row(row, model)
    
#     print({"date": row_date.strftime('%Y-%m-%d'), "prediction": prediction})
    
#     return {"date": row_date.strftime('%Y-%m-%d'), "prediction": prediction}
    
def predict(stock, dataset, objective, id):
    row_data = generateLastPredictionRow(stock, dataset, objective)
    row_date = row_data["date"]
    row = row_data["data"]
    saved_model = loadModel(id)
    #quitar luego
    print(type(saved_model))
    print(saved_model.keys())
    model = saved_model["model"]
    prediction, probabilities = predict_row(row, model)

    prediction = int(prediction[0])

    confidence = float(max(probabilities[0]))

    return {
        "ticker": stock,
        "date": row_date.strftime("%Y-%m-%d"),
        "prediction": prediction,
        "confidence": round(confidence * 100, 2)
    }
    
def check_stock(stock):
    res = checkForStock(stock=stock)
    return res

def mutual_information(dataset, stock, period , objective):
    train = _getTrainDataset(stock, period, dataset, objective)
    
    return mutualInformation(train)

def best_groups(dataset, stock, period, objective):
    train = _getTrainDataset(stock, period, dataset, objective)
    
    return BeamSearch(train, n_features=3)

def rfe_cv(dataset, stock, period, objective):
    train = _getTrainDataset(stock, period, dataset, objective)
    
    return recursiveFeatureElimination(train)

def correlation_matrix(dataset, stock, period, objective):
    train = _getTrainDataset(stock, period, dataset, objective)
    
    return correlationMatrix(train)

def feature_label_analysis(dataset, stock, period, objective):
    train = _getTrainDataset(stock, period, dataset, objective)
    
    return featureLabelAnalysis(train)

def cluster_analysis(dataset, stock, period, objective):
    train = _getTrainDataset(stock, period, dataset, objective)
    
    return clusterAnalysis(train, groups=2)
    
def _getTrainDataset(stock, period, dataset, objective):
    df = generateTrainingDataset(stock, period, dataset, objective)
    train, test = split_train_test(df)
    
    return train