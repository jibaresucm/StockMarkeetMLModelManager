from Datasets import generateTrainingDataset, generateLastDayRow, checkForStock
from Training_Prediction import autoHyperparameterSelection, train_model, predict_row
from ModelPersistance import saveModel, loadModel
from FeatureSelection import mutualInformation, BeamSearch, recursiveFeatureEliminationImportance, correlationMatrix, featureLabelAnalysis, clusterAnalysis
from DataSplit import split_train_test

def train(stock, period, dataset, objective, model_type, hyperparameters, id, optimize_hyperparameters):
    df = generateTrainingDataset(stock, period, dataset, objective)
    train, test = split_train_test(df)
    
    if optimize_hyperparameters:
        modelData = autoHyperparameterSelection(train, test, model_type)
    else:
        modelData = train_model(train, test, model_type, hyperparameters)
    
    trained_model = modelData["MODEL"]
    model_statistics = modelData["STATS"]
    
    saveModel(id, model=trained_model)
    
    return model_statistics
     
def predict(stock, dataset, objective, id):
    
    row = generateLastDayRow(stock, dataset, objective)
    model = loadModel(id)
    prediction = predict_row(row, model)
    
    print(prediction)
    
def check_stock(stock):
    res = checkForStock(stock=stock)
    return res

def mutual_information(dataset, stock, period , objective):
    train = _getTrainDataset(stock, period, dataset, objective)
    
    return mutualInformation(train)

def best_groups(dataset, stock, period, objective):
    train = _getTrainDataset(stock, period, dataset, objective)
    
    return BeamSearch(train, n_features=3)

def rfe_importance(dataset, stock, period, objective):
    train = _getTrainDataset(stock, period, dataset, objective)
    
    return recursiveFeatureEliminationImportance(train)

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