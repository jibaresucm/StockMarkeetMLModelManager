export const ALGORITHMS = [
  "RandomForestClassifier",
  "XGBoost",
  "LightGBM",
  "GradientBoostingClassifier",
  "AdaBoostClassifier",
  "LinearSVC",
  "SVC_RBF",
  "LogisticRegression",
  "KNeighborsClassifier",
  "MLPClassifier",
]

export const ALGORITHM_HYPERPARAMS = {
  RandomForestClassifier: {
    n_estimators: { type: "number", default: 100, label: "Number of Estimators", min: 10, max: 500, step: 10 },
    max_depth: { type: "number", default: 3, label: "Max Depth", min: 1, max: 20, step: 1 },
    min_samples_leaf: { type: "number", default: 40, label: "Min Samples Leaf", min: 1, max: 200, step: 5 },
    max_features: { type: "select", default: "sqrt", label: "Max Features", options: ["sqrt", "log2", "None"] },
  },
  XGBoost: {
    n_estimators: { type: "number", default: 100, label: "Number of Estimators", min: 10, max: 500, step: 10 },
    max_depth: { type: "number", default: 6, label: "Max Depth", min: 1, max: 20, step: 1 },
    learning_rate: { type: "number", default: 0.05, label: "Learning Rate", min: 0.001, max: 1, step: 0.01 },
    scale_pos_weight: { type: "number", default: 1.5, label: "Scale Pos Weight", min: 0.1, max: 5, step: 0.1 },
  },
  LightGBM: {
    n_estimators: { type: "number", default: 100, label: "Number of Estimators", min: 10, max: 500, step: 10 },
    learning_rate: { type: "number", default: 0.1, label: "Learning Rate", min: 0.001, max: 1, step: 0.01 },
    num_leaves: { type: "number", default: 31, label: "Num Leaves", min: 5, max: 200, step: 5 },
  },
  GradientBoostingClassifier: {
    n_estimators: { type: "number", default: 100, label: "Number of Estimators", min: 10, max: 500, step: 10 },
    learning_rate: { type: "number", default: 0.1, label: "Learning Rate", min: 0.001, max: 1, step: 0.01 },
    max_depth: { type: "number", default: 3, label: "Max Depth", min: 1, max: 20, step: 1 },
    subsample: { type: "number", default: 0.8, label: "Subsample", min: 0.1, max: 1, step: 0.05 },
  },
  AdaBoostClassifier: {
    n_estimators: { type: "number", default: 50, label: "Number of Estimators", min: 10, max: 500, step: 10 },
    learning_rate: { type: "number", default: 1.0, label: "Learning Rate", min: 0.01, max: 2, step: 0.01 },
  },
  LinearSVC: {
    C: { type: "number", default: 1.0, label: "Regularization (C)", min: 0.001, max: 100, step: 0.1 },
    max_iter: { type: "number", default: 1000, label: "Max Iterations", min: 50, max: 5000, step: 50 },
  },
  SVC_RBF: {
    C: { type: "number", default: 1.0, label: "Regularization (C)", min: 0.01, max: 100, step: 0.1 },
    gamma: { type: "select", default: "scale", label: "Gamma", options: ["scale", "auto"] },
  },
  LogisticRegression: {
    C: { type: "number", default: 1.0, label: "Regularization (C)", min: 0.0001, max: 100, step: 0.1 },
    max_iter: { type: "number", default: 1000, label: "Max Iterations", min: 100, max: 5000, step: 100 },
  },
  KNeighborsClassifier: {
    n_neighbors: { type: "number", default: 5, label: "Number of Neighbors", min: 1, max: 50, step: 1 },
    weights: { type: "select", default: "distance", label: "Weights", options: ["uniform", "distance"] },
    p: { type: "select", default: "2", label: "Distance Metric (p)", options: ["1", "2"] },
  },
  MLPClassifier: {
    hidden_layer_sizes: { type: "select", default: "(64, 32)", label: "Hidden Layer Sizes", options: ["(64, 32)", "(100,)", "(50, 50, 25)"] },
    alpha: { type: "number", default: 0.01, label: "Alpha (Regularization)", min: 0.0001, max: 1, step: 0.001 },
    learning_rate_init: { type: "number", default: 0.001, label: "Learning Rate Init", min: 0.0001, max: 0.1, step: 0.0001 },
  },
}

export function getDefaultHyperparams(algorithm) {
  const config = ALGORITHM_HYPERPARAMS[algorithm]
  if (!config) return {}
  const defaults = {}
  for (const [key, param] of Object.entries(config)) {
    defaults[key] = param.default
  }
  return defaults
}
