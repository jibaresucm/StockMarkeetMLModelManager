from matplotlib import pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.feature_selection import RFE, mutual_info_classif
from sklearn.model_selection import cross_val_score
from sklearn.metrics import silhouette_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier


from itertools import combinations

from sklearn.preprocessing import StandardScaler

from MLAlgorithms import _createModel
from CrossValidation import getCV, getScoring


def BeamSearch(df, n_features = 6, beam_size=20, max_candidates=10):
    model = RandomForestClassifier(
    n_estimators=10,
    bootstrap=True,
    max_depth= 3,
    random_state=42
    ) 

    X_train = df.drop("TARGET", axis = 1)
    y_train = df['TARGET']
    
    cols = X_train.columns
    
    cv = getCV()
    
    results = []
    
    for col in cols:
        score = cross_val_score(model, X_train[[col]], y_train, cv = cv, scoring=getScoring() , n_jobs=-1).mean()
        results.append({"features": (col,), "score": float(score)})
        
    beam = sorted(results, key = lambda x: x["score"], reverse=True)
    best_by_size = {1: beam[:beam_size]}
    
    cols = [elem["features"][0] for elem in beam[:max_candidates]]
    beam = beam[:beam_size]
    
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
                
                score = cross_val_score(model, X_train[features], y_train, cv = cv, scoring=getScoring(), n_jobs=-1).mean()
                
 
                score = score.item()
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

    print(best_by_size)
    
    return best_by_size

def correlationMatrix(df):
    
    corr_matrix = df.corr(method='spearman')
    csv = corr_matrix.to_csv()
    print(csv)
    
    # 2. Configuras la visualización con Matplotlib y Seaborn
    plt.figure(figsize=(10, 8))
    sns.heatmap(
        corr_matrix, 
        annot=True,          # Muestra los valores numéricos dentro de las celdas
        fmt=".2f",           # Limita a 2 decimales
        cmap='coolwarm',     # Paleta de colores (rojo/azul)
        vmin=-1, vmax=1,     # Rango estricto de correlación
        linewidths=0.5       # Líneas divisorias entre celdas
    )

    plt.title('Spearman Correlation Matrix', fontsize=14)
    plt.tight_layout()

    # 3. Muestras el gráfico en pantalla
    plt.show()
    return csv

    
def recursiveFeatureEliminationImportance(df, n_features = 7):
    y = df["TARGET"]
    X = df.drop("TARGET", inplace = False, axis = 1)
    
    bmodel = _createModel(modelString="RandomForestClassifier")
    
    n_features = min(n_features, X.shape[1])
    
    selector = RFE(bmodel, n_features_to_select=n_features, step=1)
    selector.fit(X, y)
    
    results = pd.DataFrame({
        "Feature": X.columns,
        "Ranking": selector.ranking_,
        "Selected": selector.support_.astype(int)
    }).sort_values("Ranking")
    
    print(f"Tus {n_features} variables puras son: {list(X.columns[selector.support_])}")
    
    return results.to_csv(index=False)
    
def mutualInformation(df):
    y = df["TARGET"]
    X = df.drop("TARGET", inplace = False, axis = 1)
    
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
    
    results = results[:30]
    
    print("Variables con más 'información' real sobre el Target:")
    print(results)
    
    return results.to_csv()
    
def featureLabelAnalysis(df):
    #Teoría: para que un modelo de ml clasifique una fila con un target, esta necesita ser diferienciable de otra con un label distinto
    #Si una feature para cada label tiene una distribución muy parecida el algoritmo de ml no podrá diferenciar un dia de subidau otro de bajada fijandose en esa feature
    #Distancia de Bhattacharyya -> Overlap de distribuciones, mide q tanto se parecen
    #Vamos a calcular este overlap entre cada clase -1 0 y 1 o simplemente 0 y 1 depende del target
    #Nos quedaremos con el min overlap, es decir max distance de cada feature da igual del label q describa o la comparación ya que solo queremos "diferenciar" 1 de otra
    #No estamos buscando la feature campeona que pueda diferenciar todas las clases entre si ya que no existe
    
    def _bhattacharyya_distance(g0, g1):
        """Calcula la distancia entre dos grupos de datos."""
        mu0, sigma0 = g0.mean(), g0.std()
        mu1, sigma1 = g1.mean(), g1.std()
        
        # Manejo de casos con varianza cero o NaNs
        if sigma0 == 0 or sigma1 == 0 or np.isnan(sigma0) or np.isnan(sigma1):
            return 0.0
            
        sigma_combined = (sigma0**2 + sigma1**2) / 2
        term1 = 0.125 * ((mu0 - mu1)**2 / sigma_combined)
        term2 = 0.5 * np.log(sigma_combined / (sigma0 * sigma1))
        
        return term1 + term2
    
    features = [c for c in df.columns if c != "TARGET"]
    labels = sorted(df["TARGET"].unique())
    results = {}
    label_data = {l: df[df["TARGET"] == l] for l in labels}
    
    for l1, l2 in combinations(labels, 2):
        results[f"{int(l1)} <-> {int(l2)}"] = []
    
    for f in features:
        
        for l1, l2 in combinations(labels, 2):
            curr_dist = _bhattacharyya_distance(label_data[l1][f], label_data[l2][f])
            results[f"{int(l1)} <-> {int(l2)}"].append({"Feature": f, "Distance": curr_dist})
    
    ret = {}
    for l1, l2 in combinations(labels, 2):
        print(f"Distances for {int(l1)} <-> {int(l2)}")
        ret[f"{int(l1)} <-> {int(l2)}"] = pd.DataFrame(results[f"{int(l1)} <-> {int(l2)}"]).sort_values("Distance", ascending = False).to_csv(index=False)
        print(ret[f"{int(l1)} <-> {int(l2)}"])

    return ret

def clusterAnalysis(df, groups = 2):
    features = [c for c in df.columns if c != "TARGET"]
    results = []
    
    scaler = StandardScaler()
    X = df.drop("TARGET", axis=1, inplace=False)
    y = df["TARGET"]
    X_arr = scaler.fit_transform(X)
    X_scaled = pd.DataFrame(X_arr, columns=X.columns, index=X.index)
    
    for comb in combinations(features, groups):
        f = list(comb)
        X_subset = X_scaled[f]
        
        score = silhouette_score(X_subset, y)
        results.append({"Combination": f, "Score": score})
    
    ret = pd.DataFrame(results).sort_values("Score", ascending=False)
    ret = ret[:40]
    print(ret.to_csv(index=False))
    return ret.to_csv(index=False)