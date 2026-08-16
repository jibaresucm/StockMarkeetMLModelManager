from Targets import all_targets
from Features import all_features
from EventSampling import all_sampling_methods
from MLAlgorithms import all_models
from actions import check_stock

def validateDatasetDict(dataset : dict) -> tuple:
    features = dataset.keys()
    print(dataset)
    
    for elem in features:
        if elem not in all_features:
            return(False, F"{elem} is not a valid feature.")

        elif all_features[elem] and not isinstance(dataset[elem], list):
            return (False, F"{elem} value should be a list")
        
        elif all_features[elem] and isinstance(dataset[elem], list):
            
            for window in dataset[elem]:
                if type(window) is not int:
                    return (False, f"{elem} list elemnts should be all integers")
                elif window > 200:
                    return(False, f"In feature {elem} windows greater than 200 are not allowed")
                
        elif not all_features[elem] and (type(dataset[elem]) is not bool or dataset[elem] != True):
            return (False, f"In feature {elem} the value should be True")
            
    
    return (True, None)

def validateModelType(model_type : str) -> tuple:
    if model_type not in all_models: return (False, f"{model_type} is not a valid algorithm, please choose a valid one")
    return (True, None)

def validateObjectiveDict(objective : dict) -> tuple:
    info = objective.keys()
    required_fields = ["TARGET", "SAMPLING"]
    
    
    for elem in info:
        if elem not in required_fields:
            return (False, f"Unknown field in objective dictionary: {elem}")
        
    for elem in required_fields:
        if elem not in info:
            return (False, f"Missing field in objective dictionary: {elem}")
        
    target = objective["TARGET"]
    
    if type(target) is not str or target not in all_targets:
        return (False, f"Invalid target in objective dict, please choose a valid one")
    
    sampling = objective["SAMPLING"]
    
    if type(sampling) is not str or sampling not in all_sampling_methods:
        return (False, f"Invalid sampling method in objective dict, please choose a valid one")
        
    return (True, None)

def validateTicker(ticker: str) -> tuple:
    ticker = ticker.upper().strip()
    available = check_stock(ticker)
    
    if not available :
    
        return (False, f"No hay datos de mercado para {ticker}. Comprueba el ticker o la conexion con yfinance.")
    return (True, None)

def validatePeriod(period: int) -> tuple:
    return (True, None)

def validateHyperparameters(hyperparameters: dict) -> tuple:
    return (True, None)

def validateId(id : int):
    return (True, None)

def validateFSDatasetLogic(dataset : dict, sample_dataset : bool) -> tuple:
    if dataset == None:
        if not sample_dataset: return (False, "Please provide a valid dataset or select the sample_dataset")
        else: return(True, None)
    
    return validateDatasetDict(dataset)