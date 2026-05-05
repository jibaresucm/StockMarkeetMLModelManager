from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import GridSearchCV

from MLAlgorithms import _createModel, _createModelForGrid, _getRangesForOptimization
from CrossValidation import getCV, getScoring


def train_model(train, test, model_type, hyperparams):

    X_train = train.drop("TARGET", axis = 1)
    y_train = train['TARGET']

    X_test = test.drop("TARGET", axis = 1)
    y_test = test['TARGET']

    #Create model
    model = _createModel(model_type, hyperparams)
    
    #Train model
    model.fit(X_train, y_train)
    
    #Generate scores TODO
    
    y_pred = model.predict(X_test)
    y_pred_train = model.predict(X_train)

    reporte_texto_train = classification_report(y_train, y_pred_train)
    reporte_texto = classification_report(y_test, y_pred)

    print(reporte_texto_train)
    print(reporte_texto)
    
    cm = confusion_matrix(y_test, y_pred)
    cm_train = confusion_matrix(y_train, y_pred_train)
    
    print(cm)
    print(cm_train)
    
    return {"MODEL": model, "STATS": {"TRAIN": cm_train, "TEST": cm}}

def autoHyperparameterSelection(train, test, model_type):
    #split test_train
    #Como analizamos mercado no podemos hacerlo cogiendo días randomizados sino en timeframes (series)
    
    X_train = train.drop("TARGET", axis = 1)
    y_train = train['TARGET']

    X_test = test.drop("TARGET", axis = 1)
    y_test = test['TARGET']

    #Create model
    bmodel = _createModelForGrid(model_type)
    
    hyperpRanges = _getRangesForOptimization(model_type)
    cv = getCV()
    
    grid_search = GridSearchCV(
        estimator=bmodel,
        param_grid=hyperpRanges,
        scoring = getScoring(),
        cv= cv, #Crossvalidation en series no randomizada, requerida para predecir stocks
        n_jobs=-1,
    )
    
    grid_search.fit(X_train, y_train)
    
    model = grid_search.best_estimator_
    
    print(grid_search.best_params_)
    print(grid_search.best_score_)
    print(f"Iteración ganadora: {grid_search.best_index_}")
    
    y_pred = model.predict(X_test)
    y_pred_train = model.predict(X_train)
    
    reporte_texto_train = classification_report(y_train, y_pred_train)
    reporte_texto = classification_report(y_test, y_pred)

    print(reporte_texto_train)
    print(reporte_texto)
    
    cm = confusion_matrix(y_test, y_pred)
    cm_train = confusion_matrix(y_train, y_pred_train)
    
    print(cm)
    print(cm_train)
    
    return {"MODEL": model, "STATS": {"TRAIN": cm_train, "TEST": cm}}

def predict_row(day, model):
    pred = model.predict(day)
    pred_proba = model.predict_proba(day)
    
    return (pred, pred_proba)