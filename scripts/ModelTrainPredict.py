from sklearn.metrics import classification_report

from ModelCreation import _createModel


def trainAndSave(df, model_type, hyperparams):
    #Split test train
    train_size = int(len(df) * 0.8)

    train = df.iloc[:train_size]
    test = df.iloc[train_size:]

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
    return {"MODEL": model, "STATS": {}}

def predict(df, model):
    
    print(df)
    
    pred = model.predict(df)
    pred_proba = model.predict_proba(df)
    
    umbral = 0.53
    preds_con_umbral = (pred_proba >= umbral).astype(int)
    
    print(pred)
    print(pred_proba)#[Prob de q sea 0, prob de q sea 1]
    print(preds_con_umbral)
