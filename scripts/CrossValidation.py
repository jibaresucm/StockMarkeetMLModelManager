
from sklearn.model_selection import BaseCrossValidator, KFold

class PurgingBlockKFold(BaseCrossValidator):
    
    def __init__(self, n_splits=4, gap = 1):
        self.n_splits = n_splits
        self.gap = gap
        
    def get_n_splits(self, X=None, y=None, groups=None):
        return self.n_splits
    
    def split(self, X, y = None, groups = None):
        kf = KFold(n_splits=self.n_splits, shuffle=False)
        
        for train_idx, test_idx in kf.split(X):
            
            test_idx = test_idx[self.gap: -self.gap]
            
            if(len(test_idx) > 0):
                yield train_idx, test_idx

cv = PurgingBlockKFold()
cv = KFold(n_splits=4, shuffle=False)

def getCV():
    return cv



            
        
#Custom CV (Not used)
"""import numpy as np
from sklearn.model_selection import BaseCrossValidator

class RandomBlockCV(BaseCrossValidator):
    def __init__(self, n_splits=5, block_size=100, gap=5):
        self.n_splits = n_splits
        self.block_size = block_size
        self.gap = gap
        
    def split(self, X, y = None, groups = None):
        samples = len(X)
        
        for _ in range(self.n_splits):
            val_b_start = np.random.randint(0, samples - self.block_size)
            val_b_end = val_b_start + self.block_size
            
            validation_idx = np.arange(val_b_start , val_b_end)
            
            train_left_split = max(0, val_b_start - self.gap)
            train_right_split = min(samples, val_b_end + self.gap)
            
            mask_train = np.ones(samples, dtype=bool)
            mask_train[train_left_split : train_right_split] = False
            
            train_idx = np.where(mask_train)[0]
            
            yield train_idx, validation_idx
            
    def get_n_splits(self, X=None, y=None, groups=None):
        return self.n_splits
    """