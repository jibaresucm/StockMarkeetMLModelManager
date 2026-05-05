import { useState } from "react"
import { ChevronDown, ChevronRight, Zap, Search } from "lucide-react"
import { FEATURE_CATALOG, getFullDatasetFeatures } from "../../constants/featureCatalog"
import { ALGORITHM_HYPERPARAMS, getDefaultHyperparams } from "../../constants/algorithmConfig"
import { modelsApi } from "../../api"

function Toggle({ checked, onChange, disabled = false, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onChange(!checked) }}
      className={`relative inline-flex w-9 h-5 flex-shrink-0 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        checked ? "bg-indigo-500" : "bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  )
}

export default function StrategyEditor({ data, onChange, stock, period, options, panel, onFeatureAnalysis }) {
  const showFeatures = !panel || panel === "features"
  const showAlgorithm = !panel || panel === "algorithm"
  const [collapsedSections, setCollapsedSections] = useState({})
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analyzeFullDataset, setAnalyzeFullDataset] = useState(false)
  // Per-algorithm map of which hyperparameters are enabled. UI-only — undefined means enabled.
  const [enabledHyperparams, setEnabledHyperparams] = useState({})

  const isHyperparamEnabled = (algo, key) =>
    enabledHyperparams[algo]?.[key] !== false

  const toggleHyperparamEnabled = (algo, key) => {
    setEnabledHyperparams(prev => ({
      ...prev,
      [algo]: { ...prev[algo], [key]: !isHyperparamEnabled(algo, key) },
    }))
  }

  const features = data.features || {}
  const hyperparameters = data.hyperparameters || {}
  const apiFeatures = options?.features || {}
  const modelTypes = options?.model_types || []

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Resolve effective config by merging local catalog with API truth for hasWindows
  const resolveConfig = (key, config) => {
    const apiHasWindows = !!apiFeatures[key]
    return {
      ...config,
      hasWindows: apiHasWindows,
      defaultWindows: config.defaultWindows || [20],
    }
  }

  // Feature toggling
  const toggleFeature = (key, config) => {
    const eff = resolveConfig(key, config)
    const updated = { ...features }
    if (updated[key] !== undefined) {
      delete updated[key]
    } else {
      updated[key] = eff.hasWindows ? [...eff.defaultWindows] : true
    }
    onChange({ ...data, features: updated })
  }

  const updateWindows = (key, value) => {
    const nums = value.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0)
    onChange({ ...data, features: { ...features, [key]: nums.length > 0 ? nums : features[key] } })
  }

  // Full dataset toggle
  const toggleFullDataset = (checked) => {
    if (checked) {
      onChange({ ...data, features: getFullDatasetFeatures() })
    } else {
      onChange({ ...data, features: {} })
    }
  }

  const isFullDataset = () => {
    const full = getFullDatasetFeatures()
    const fullKeys = Object.keys(full)
    const currentKeys = Object.keys(features)
    return fullKeys.length === currentKeys.length && fullKeys.every(k => features[k] !== undefined)
  }

  // Select all / deselect all for a section (already filtered to API-known features)
  const selectAllSection = (sectionFeatures, select) => {
    const updated = { ...features }
    for (const [key, config] of Object.entries(sectionFeatures)) {
      if (select) {
        const eff = resolveConfig(key, config)
        updated[key] = eff.hasWindows ? [...eff.defaultWindows] : true
      } else {
        delete updated[key]
      }
    }
    onChange({ ...data, features: updated })
  }

  // Algorithm change
  const handleAlgorithmChange = (algo) => {
    onChange({
      ...data,
      model_type: algo,
      hyperparameters: getDefaultHyperparams(algo),
    })
  }

  // Hyperparameter change
  const handleHyperparamChange = (key, value) => {
    onChange({
      ...data,
      hyperparameters: { ...hyperparameters, [key]: value },
    })
  }

  // Auto-optimize toggle
  const toggleOptimize = (checked) => {
    onChange({ ...data, optimize_hyperparameters: checked })
  }

  // Feature analysis
  const runAnalysis = async () => {
    setAnalysisLoading(true)
    setAnalysisResult(null)
    try {
      const payload = {
        stock,
        period,
        model_type: data.model_type,
        features: analyzeFullDataset ? getFullDatasetFeatures() : features,
        full_dataset: analyzeFullDataset,
        target: data.target,
        sampling: data.sampling,
      }

      const [mutualResult, correlationResult] = await Promise.all([
        modelsApi.featureAnalysis({ ...payload, kind: "mutual_information" }),
        modelsApi.featureAnalysis({ ...payload, kind: "correlation_matrix" }),
      ])

      const result = {
        features: analyzeFullDataset ? getFullDatasetFeatures() : features,
        mutual_info: mutualResult?.data || mutualResult,
        correlations: correlationResult?.data || correlationResult,
      }

      if (onFeatureAnalysis) {
        onFeatureAnalysis(result)
      } else {
        setAnalysisResult(JSON.stringify(result, null, 2))
      }
    } catch (err) {
      if (onFeatureAnalysis) {
        onFeatureAnalysis({ error: err.message })
      } else {
        setAnalysisResult("Error: " + err.message)
      }
    } finally {
      setAnalysisLoading(false)
    }
  }

  const featureCount = Object.keys(features).length

  const gridCols = showFeatures && showAlgorithm ? "lg:grid-cols-2" : "lg:grid-cols-1"

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-6 min-h-[400px]`}>
      {/* LEFT PANEL - Feature Selection */}
      {showFeatures && (
      <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200">Features ({featureCount} selected)</h3>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isFullDataset()}
              onChange={e => toggleFullDataset(e.target.checked)}
              className="accent-indigo-500"
            />
            Full Dataset
          </label>
        </div>

        {Object.entries(FEATURE_CATALOG).map(([sectionName, sectionFeaturesAll]) => {
          // Filter to features that actually exist in the API
          const sectionFeatures = Object.fromEntries(
            Object.entries(sectionFeaturesAll).filter(([key]) => key in apiFeatures)
          )
          if (Object.keys(sectionFeatures).length === 0) return null

          const collapsed = collapsedSections[sectionName]
          const selectedCount = Object.keys(sectionFeatures).filter(k => features[k] !== undefined).length
          const totalCount = Object.keys(sectionFeatures).length

          return (
            <div key={sectionName} className="border border-indigo-800 rounded-lg overflow-hidden">
              {/* Section header */}
              <button
                type="button"
                onClick={() => toggleSection(sectionName)}
                className="flex items-center justify-between w-full px-3 py-2 bg-indigo-900/50 hover:bg-indigo-900 transition text-left"
              >
                <div className="flex items-center gap-2">
                  {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  <span className="text-sm font-medium text-slate-200">{sectionName}</span>
                  <span className="text-xs text-slate-400">({selectedCount}/{totalCount})</span>
                </div>
                <div className="flex gap-1">
                  <span
                    onClick={e => { e.stopPropagation(); selectAllSection(sectionFeatures, true) }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer px-1"
                  >
                    All
                  </span>
                  <span className="text-xs text-slate-600">|</span>
                  <span
                    onClick={e => { e.stopPropagation(); selectAllSection(sectionFeatures, false) }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer px-1"
                  >
                    None
                  </span>
                </div>
              </button>

              {/* Feature rows */}
              {!collapsed && (
                <div className="px-3 py-2 space-y-2">
                  {Object.entries(sectionFeatures).map(([key, config]) => {
                    const eff = resolveConfig(key, config)
                    const isEnabled = features[key] !== undefined
                    return (
                      <div key={key} className="space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => toggleFeature(key, config)}
                            className="accent-indigo-500"
                          />
                          <span className={`text-sm ${isEnabled ? "text-slate-200" : "text-slate-400"}`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-slate-500 hidden group-hover:inline">
                            {key}
                          </span>
                        </label>

                        {/* Window size input */}
                        {isEnabled && eff.hasWindows && (
                          <input
                            type="text"
                            value={Array.isArray(features[key]) ? features[key].join(", ") : ""}
                            onChange={e => updateWindows(key, e.target.value)}
                            placeholder="Window sizes (e.g. 7, 20)"
                            className="ml-6 w-48 text-xs border border-indigo-700 bg-indigo-900 px-2 py-1 rounded text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Feature Analysis Button */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="radio"
                name="analysisMode"
                checked={!analyzeFullDataset}
                onChange={() => setAnalyzeFullDataset(false)}
                className="accent-indigo-500"
              />
              Selected features
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="radio"
                name="analysisMode"
                checked={analyzeFullDataset}
                onChange={() => setAnalyzeFullDataset(true)}
                className="accent-indigo-500"
              />
              Full dataset
            </label>
          </div>
          <button
            type="button"
            onClick={runAnalysis}
            disabled={analysisLoading || (!analyzeFullDataset && featureCount === 0)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-700 hover:bg-indigo-600 text-white rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Search size={14} />
            {analysisLoading ? "Analyzing..." : "Feature Analysis"}
          </button>
        </div>

        {/* Analysis results */}
        { analysisResult && (
          <div className="border border-indigo-700 rounded-lg p-3 bg-indigo-950 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">Analysis Results</span>
              <button
                type="button"
                onClick={() => setAnalysisResult(null)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Close
              </button>
            </div>
            <pre className="text-xs text-slate-400 whitespace-pre-wrap">{analysisResult}</pre>
          </div>
        )}
      </div>
      )}

      {/* RIGHT PANEL - Algorithm & Hyperparameters */}
      {showAlgorithm && (
      <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
        <h3 className="text-sm font-semibold text-slate-200">Algorithm & Hyperparameters</h3>

        {/* Algorithm toggles */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">Algorithm</label>
          <div className="border border-indigo-700 rounded-lg overflow-hidden divide-y divide-indigo-800">
            {modelTypes.map(algo => {
              const isActive = data.model_type === algo
              return (
                <div
                  key={algo}
                  onClick={() => { if (!isActive) handleAlgorithmChange(algo) }}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition ${
                    isActive ? "bg-indigo-800/60" : "hover:bg-indigo-900/40"
                  }`}
                >
                  <span className={`text-sm ${isActive ? "text-slate-100 font-medium" : "text-slate-300"}`}>
                    {algo}
                  </span>
                  <Toggle
                    checked={isActive}
                    onChange={() => { if (!isActive) handleAlgorithmChange(algo) }}
                    ariaLabel={`Select ${algo}`}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Auto-optimize toggle */}
        <div className="flex items-center gap-3 p-3 border border-indigo-700 rounded-lg bg-indigo-900/50">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.optimize_hyperparameters || false}
              onChange={e => toggleOptimize(e.target.checked)}
              className="accent-indigo-500"
            />
            <div>
              <span className="text-sm text-slate-200 flex items-center gap-1">
                <Zap size={14} className="text-yellow-400" />
                Auto-optimize (GridSearchCV)
              </span>
              {data.optimize_hyperparameters && (
                <p className="text-xs text-slate-400 mt-1">
                  Hyperparameters will be automatically optimized during training
                </p>
              )}
            </div>
          </label>
        </div>

        {/* Hyperparameter inputs */}
        <div className={`space-y-3 transition-opacity ${data.optimize_hyperparameters ? "opacity-40 pointer-events-none" : ""}`}>
          {ALGORITHM_HYPERPARAMS[data.model_type] &&
            Object.entries(ALGORITHM_HYPERPARAMS[data.model_type]).map(([key, config]) => {
              const enabled = isHyperparamEnabled(data.model_type, key)
              const inputDisabled = data.optimize_hyperparameters || !enabled
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`text-xs ${enabled ? "text-slate-400" : "text-slate-600"}`}>
                      {config.label}
                    </label>
                    <Toggle
                      checked={enabled}
                      onChange={() => toggleHyperparamEnabled(data.model_type, key)}
                      disabled={data.optimize_hyperparameters}
                      ariaLabel={`Toggle ${config.label}`}
                    />
                  </div>
                  {config.type === "select" ? (
                    <select
                      value={hyperparameters[key] ?? config.default}
                      onChange={e => handleHyperparamChange(key, e.target.value)}
                      disabled={inputDisabled}
                      className="w-full border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {config.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={hyperparameters[key] ?? config.default}
                      onChange={e => handleHyperparamChange(key, parseFloat(e.target.value))}
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      disabled={inputDisabled}
                      className="w-full border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    />
                  )}
                </div>
              )
            })
          }
        </div>
      </div>
      )}
    </div>
  )
}
