from matplotlib import pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.feature_selection import RFE, mutual_info_classif
from sklearn.model_selection import TimeSeriesSplit
from sklearn_genetic import GAFeatureSelectionCV

from Datasets import featureListToFeatureDict
from ModelCreation import _createModel
from BeamSearch import BeamSearch
from CrossValidation import getCV


def manualFeatureSelection(df, model_type, hyperparams):
    y = df["TARGET"]
    X = df.drop("TARGET", inplace = False, axis = 1)
    
    #Beam search
    BeamSearch(df, n_features=3)
    
    #Hacemos Mutual information
    mutualInformation(X, y)
    
    #Hacemos RFE
    recursiveFeatureEliminationImportance(X, y, model_type, hyperparams)
    
    #Hacemos spearman corr matrix
    correlationMatrix(df)

def correlationMatrix(df):
    
    corr_matrix = df.corr(method='spearman')
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt=".2f", linewidths=0.5)
    plt.title("Matriz de Correlación de Spearman")
    plt.show()
    
def recursiveFeatureEliminationImportance(X,y, model_type, hyperparams):
    
    bmodel = _createModel(model_type, hyperparams)
    
    selector = RFE(bmodel, n_features_to_select=10, step=1)
    selector.fit(X, y)
    
    features_estrellas = X.columns[selector.support_]
    print(f"Tus 10 variables puras son: {features_estrellas}")
    
def mutualInformation(X, y):
    print(X)
    block_size = 20
    n_permutations = 50
    real_mi = mutual_info_classif(X, y, random_state=42, n_neighbors=3)
    n_samples = len(y)
    n_blocks = n_samples // block_size
    shuffled_mi_scores = np.zeros((n_permutations, X.shape[1]))

    for p in range(n_permutations):
        block_indices = [np.arange(i * block_size, (i + 1) * block_size) for i in range(n_blocks)]
        np.random.shuffle(block_indices)
        
        y_shuffled_indices = np.concatenate(block_indices)
        
        remaining = n_samples - len(y_shuffled_indices)
        if remaining > 0:
            y_shuffled_indices = np.concatenate([y_shuffled_indices, np.arange(len(y_shuffled_indices), n_samples)])
            
        y_block_shuffled = y.iloc[y_shuffled_indices].values if isinstance(y, pd.Series) else y[y_shuffled_indices]
        
        shuffled_mi_scores[p, :] = mutual_info_classif(X, y_block_shuffled, random_state=p)

    # Resultados
    mean_noise_mi = shuffled_mi_scores.mean(axis=0)
    net_mi = real_mi - mean_noise_mi
    
    results = pd.DataFrame({
        'Feature': X.columns,
        'Net_MI': net_mi,
        "Real MI": real_mi,
        'Confidence': (real_mi > mean_noise_mi).astype(int)
    }).sort_values(by='Net_MI', ascending=False)
    
    print("Variables con más 'información' real sobre el Target:")
    print( results)

def autoFeatureSelectionGEN(df, model_type, hyperparams): 
    """Devuelve un featureDict con las mejores features del df"""
    #split test_train
    #Como analizamos mercado no podemos hacerlo cogiendo días randomizados sino en timeframes (series)
    
    train_size = int(len(df) * 0.8)

    train = df.iloc[:train_size]

    X_train = train.drop("TARGET", axis = 1)
    y_train = train['TARGET']

    columns = X_train.columns

    #Create model
    bmodel = _createModel(model_type, hyperparams)
    
    cv = getCV()
    
    fSelection = GAFeatureSelectionCV(
        estimator=bmodel,
        cv=cv,
        scoring='f1_macro',
        population_size=45,   # Cuántas combinaciones distintas prueba por generación
        generations=30,       # Cuántas veces "evoluciona" la población
        mutation_probability=0.1,# Probabilidad de cambios al azar en las variables
        crossover_probability=0.80, # Probabilidad de mezclar dos combinaciones buenas,
        n_jobs=8,
        elitism=True,
        tournament_size=2,
        max_features= 16,
    )

    fSelection.fit(X_train, y_train)
    mejores_features = columns[fSelection.support_].to_list()

    return featureListToFeatureDict(mejores_features)
    