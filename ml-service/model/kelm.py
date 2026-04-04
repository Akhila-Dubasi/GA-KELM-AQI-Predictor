import numpy as np
class KELM:
    def __init__(self, gamma=0.1, C=1):
        self.gamma = gamma
        self.C = C
    def rbf_kernel(self, X1, X2):
        sq_dist = (
            np.sum(X1**2, axis=1).reshape(-1, 1)
            + np.sum(X2**2, axis=1)
            - 2 * np.dot(X1, X2.T)
        )
        return np.exp(-self.gamma * sq_dist)
    def fit(self, X, y):
        self.X = X
        K = self.rbf_kernel(X, X)
        n = K.shape[0]
        identity = np.eye(n)
        # 🔥 FAST + STABLE (UPDATED)
        self.beta = np.linalg.solve(K + identity / self.C, y)

    def predict(self, X):
        K = self.rbf_kernel(X, self.X)
        return K.dot(self.beta)