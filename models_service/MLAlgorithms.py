from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.ensemble import AdaBoostClassifier, GradientBoostingClassifier, RandomForestClassifier
import xgboost
import lightgbm

def _createModel(modelString, hyperParametersDict = {}):
    match modelString:
        case "RandomForestClassifier":
            return RandomForestClassifier(
                n_estimators=hyperParametersDict.get('n_estimators', 100),
                max_depth=hyperParametersDict.get('max_depth', 3),
                min_samples_leaf=hyperParametersDict.get('min_samples_leaf', 40),
                max_features=hyperParametersDict.get('max_features', "sqrt"),
                class_weight="balanced",
                bootstrap=hyperParametersDict.get('bootstrap', True),
                random_state=42
            )
        case "LinearSVC":
            return SVC(
                kernel='linear',
                C=hyperParametersDict.get('C', 1.0),
                probability=True,
                max_iter=hyperParametersDict.get('max_iter', 1000),
                random_state=42
            )
        case "LogisticRegression":
            return LogisticRegression(
                C=hyperParametersDict.get('C', 1.0),
                max_iter=hyperParametersDict.get('max_iter', 1000),
                random_state=42
            )
        case "AdaBoostClassifier":
            return AdaBoostClassifier(
                n_estimators=hyperParametersDict.get('n_estimators', 50),
                learning_rate=hyperParametersDict.get('learning_rate', 1.0),
                random_state=42
            )
        case "XGBoost":
            return xgboost.XGBClassifier(
                n_estimators=hyperParametersDict.get('n_estimators', 100),
                max_depth=hyperParametersDict.get('max_depth', 6),
                learning_rate=hyperParametersDict.get('learning_rate', 0.05),
                subsample=0.8,
                # Evita el bias hacia el 1 si tus datos están desequilibrados
                scale_pos_weight=hyperParametersDict.get('scale_pos_weight', 1.5), 
                random_state=42,

            )
        case "LightGBM":
            return lightgbm.LGBMClassifier(
                n_estimators=hyperParametersDict.get('n_estimators', 100),
                learning_rate=hyperParametersDict.get('learning_rate', 0.1),
                num_leaves=hyperParametersDict.get('num_leaves', 31),
                random_state=42,
                verbose=-1
            )
        case "GradientBoostingClassifier": 
            return GradientBoostingClassifier(
                n_estimators=hyperParametersDict.get('n_estimators', 100),
                learning_rate=hyperParametersDict.get('learning_rate', 0.1),
                max_depth=hyperParametersDict.get('max_depth', 3), # Árboles cortos para evitar overfitting
                subsample=hyperParametersDict.get('subsample', 0.8), # Solo usa el 80% de datos por árbol (más robusto)
                random_state=42
            )
        case "KNeighborsClassifier": 
            return KNeighborsClassifier(
                n_neighbors=hyperParametersDict.get('n_neighbors', 5),
                weights='uniform',
                leaf_size=30,
            )
        case "MLPClassifier":
            return MLPClassifier(
                hidden_layer_sizes=hyperParametersDict.get('hidden_layer_sizes', (64, 32)),
                activation='relu',
                solver='adam',
                alpha=hyperParametersDict.get('alpha', 0.01), # Regularización fuerte para trading
                max_iter=500,
                early_stopping=True,
                random_state=42
            )
        case "SVC_RBF": # SNIPER (Zonas Geométricas)
            return SVC(
                kernel='rbf',
                C=hyperParametersDict.get('C', 1.0),
                gamma='scale', # Define qué tan "curva" es la frontera
                probability=True, # Necesario para el umbral >= 0.55
                class_weight='balanced', # Para que no ignore los ceros (ventas)
                random_state=42,
            )
        
def _createModelForGrid(modelString):
    match modelString:
        # Generales
        case "RandomForestClassifier":
            return RandomForestClassifier(random_state=42, bootstrap=True, class_weight="balanced",)
            
        case "LinearSVC":
            return SVC(kernel='linear', probability=True, random_state=42)
            
        case "LogisticRegression":
            return LogisticRegression(random_state=42, max_iter=1000)
            
        case "AdaBoostClassifier":
            return AdaBoostClassifier(random_state=42)
        
        case "XGBoost":
            return xgboost.XGBClassifier(random_state=42, eval_metric='logloss')
            
        case "LightGBM":
            return lightgbm.LGBMClassifier(random_state=42, verbose=-1)
            
        case "GradientBoostingClassifier":
            return GradientBoostingClassifier(random_state=42)
            
        case "KNeighborsClassifier":
            return KNeighborsClassifier()
            
        case "MLPClassifier":
            return MLPClassifier(random_state=42, early_stopping=True)
            
        case "SVC_RBF":
            return SVC(kernel='rbf', probability=True, random_state=42, class_weight='balanced')        

def _getRangesForOptimization(modelString):
    match modelString:
        case "RandomForestClassifier":
            return {
                    "n_estimators": [50, 80, 100, 120, 150],
                    "max_depth": [3, 4, 5, 6],
                    "min_samples_leaf": [20, 40, 60, 80, 100],
                    "max_features": ['sqrt', 'log2', None],
                    "bootstrap": [False, True]
                }
        case "LinearSVC":
            return {
                "C": [0.001, 0.01, 0.03, 0.05, 0.06, 0.07 ,0.08, 0.1, 0.3, 0.5, 0.8, 1.0, 10.0],
                "max_iter": [10, 20, 50, 100, 200, 500, 1000, 2000]
            }
        case "LogisticRegression":
            return {
                "solver": ["saga"],
                "penalty": ["l1", "l2"],
                "max_iter": [500, 1000]
            }
        case "AdaBoostClassifier":
            return {
                "n_estimators": [50, 80, 100, 120, 150, 200, 300],
                "learning_rate": [0.01, 0.05, 0.1, 0.5, 1.0]
            }
        case "XGBoost":
            return {
                "n_estimators": [50, 80 ,100, 150, 200, 500],
                "max_depth": [3, 4, 5, 6],
                "learning_rate": [0.01, 0.05, 0.1, 0.2],
                "scale_pos_weight": [0.8, 1.0, 1.2, 1.5]
            }
        case "LightGBM":
            return {
                "n_estimators": [50, 100, 200, 500],
                "max_depth": [3, 4, 5, 6],
                "learning_rate": [0.01, 0.05, 0.1, 0.2],
                "num_leaves": [20, 31, 50, 100],
                "min_child_samples": [10, 20, 30, 50]
            }
        case "GradientBoostingClassifier":
            return {
                "n_estimators": [50, 100, 200, 500],
                "learning_rate": [0.01, 0.05, 0.1],
                "max_depth": [3, 4, 5, 6],
                "subsample": [0.6, 0.7, 0.8, 0.9]
            }
        case "KNeighborsClassifier":
            return {
                "n_neighbors": [3, 5, 7, 11, 15, 21, 30],
                "weights": ['uniform', 'distance'],
                "p": [1, 2]
            }
        case "MLPClassifier":
            return {
                "hidden_layer_sizes": [(64, 32), (100,), (50, 50, 25)],
                "alpha": [0.0001, 0.001, 0.01, 0.1],
                "learning_rate_init": [0.0001, 0.001, 0.01]
            }
        case "SVC_RBF":
            return {
                "C": [0.1, 1.0, 10.0, 100.0],
                "gamma": ['scale', 'auto', 0.1, 0.01, 0.001]
            }

all_models = [
    "RandomForestClassifier",
    "LinearSVC",
    "LogisticRegression",
    "AdaBoostClassifier",
    "XGBoost",
    "LightGBM",
    "GradientBoostingClassifier",
    "KNeighborsClassifier",
    "MLPClassifier",
    "SVC_RBF"
]

def validModelDict(modelDescDict):
    required_fields = {
        "ID": int,
        "STOCK": str,
        "PERIOD": int,
        "MODEL_TYPE": str,
        "HYPERPARAMETERS": dict,
    }
    
    for key, expected_type in required_fields.items():
        if key not in modelDescDict:
            return False
        if not isinstance(modelDescDict[key], expected_type):
            return False
        
    return True