
from itertools import combinations

import numpy as np
from sklearn.metrics import make_scorer, precision_score
from sklearn.model_selection import BaseCrossValidator, KFold

class CombinationalPurgingCrossValidation(BaseCrossValidator):
    
    def __init__(self, n_splits=4, n_test_blocks = 1, gap = 5):
        self.n_splits = n_splits
        self.gap = gap
        self.n_test_blocks = n_test_blocks
        
    def get_n_splits(self, X=None, y=None, groups=None):
        return self.n_splits
    
    def split(self, X, y = None, groups = None):
        n_samples = len(X)
        indices = np.arange(n_samples)
        
        kf = KFold(n_splits=self.n_splits, shuffle=False)
        block_indices = [idx for _, idx in kf.split(X)]
        
        for test_blocks in combinations(range(self.n_splits), self.n_test_blocks):
            
            test_idx = np.concatenate([block_indices[i] for i in test_blocks])
            test_idx = np.sort(test_idx)
            
            train_idx = indices.copy()
            
            
            for i in test_blocks:
                start = block_indices[i][0]
                end = block_indices[i][-1]

                test_and_gap = np.arange(max(0, start - self.gap), min(n_samples, end + self.gap))
                train_idx = np.setdiff1d(train_idx, test_and_gap)
            
            yield train_idx, test_idx

cv = CombinationalPurgingCrossValidation()

def getCV():
    return cv

scoring = make_scorer(precision_score, average='macro', zero_division=0)
scoring = "f1_macro"

def getScoring():
    return scoring