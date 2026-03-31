
from sklearn.metrics import classification_report
from sklearn.model_selection import GridSearchCV

from ModelCreation import _createModelForGrid, _getRangesForOptimization
from CrossValidation import getCV


def autoHyperparameterSelection(df, model_type):
    #split test_train
    #Como analizamos mercado no podemos hacerlo cogiendo días randomizados sino en timeframes (series)
    
    train_size = int(len(df) * 0.8)

    train = df.iloc[:train_size]
    test = df.iloc[train_size:]

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
        scoring = "f1_macro",
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
    
    return {"MODEL": model, "HYPERPARAMETERS": grid_search.best_params_, "STATS": {}}
