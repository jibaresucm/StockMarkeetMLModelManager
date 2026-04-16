from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from ModelCreation import _createModel
from CrossValidation import getCV

def BeamSearch(df, n_features = 3, beam_size=10):
    model = _createModel(modelString="RandomForestClassifier", hyperParametersDict={"max_features": None, "bootstrap": False, "n_estimators": 40})
    
    train_size = int(len(df) * 0.8)
    train = df.iloc[:train_size]

    X_train = train.drop("TARGET", axis = 1)
    y_train = train['TARGET']
    
    cols = X_train.columns
    
    cv = getCV()
    
    results = []
    
    for col in cols:
        score = cross_val_score(model, X_train[[col]], y_train, cv = cv, scoring="f1_macro", n_jobs=-1).mean()
        results.append({"features": (col,), "score": score})
        
    beam = sorted(results, key = lambda x: x["score"], reverse=True)
    #beam = beam[:beam_size]
    
    best_by_size = {1: beam}
    
    for i in range(2, n_features + 1):
        searched = set()
        results = []
        for elem in beam:
            level_results = []
            for col in cols:
                
                if col in elem["features"]:
                    continue
                
                features = list(elem["features"]) + [col]
                curr_id = tuple(sorted(features))
                
                if curr_id in searched:
                    continue
                
                searched.add(curr_id)
                
                score = cross_val_score(model, X_train[features], y_train, cv = cv, scoring="f1_macro", n_jobs=-1).mean()
                
                if score > elem["score"]:
                    level_results.append({"features": curr_id, "score": score})
                
            level_results = sorted(level_results, key = lambda x: x["score"], reverse=True)

            results.extend(level_results[:2])
            
        beam = sorted(results, key = lambda x: x["score"], reverse=True)
        beam = beam[:beam_size]
        
        best_by_size[i] = beam
        
    for group_size, group_list in best_by_size.items():
        print(f"Grupos de tamaño {group_size}:")
        for elem in group_list:
            print(f"{elem['features']}: {elem['score']}")
            
    return best_by_size
