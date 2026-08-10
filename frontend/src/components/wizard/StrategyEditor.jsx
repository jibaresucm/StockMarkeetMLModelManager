import { useState, useMemo } from "react"
import { ChevronDown, ChevronRight, Zap, Search, AlertTriangle, Info, X } from "lucide-react"
import { FEATURE_CATALOG, getFullDatasetFeatures, columnToFeature } from "../../constants/featureCatalog"
import { ALGORITHM_HYPERPARAMS, getDefaultHyperparams } from "../../constants/algorithmConfig"
import { modelsApi } from "../../api"
import AnalysisPanel, { parseAnalysis } from "./AnalysisPanel"

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
        checked ? "bg-indigo-600" : "bg-slate-300"
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

function WindowChips({ windows, onChange }) {
  const [adding, setAdding] = useState("")

  const add = () => {
    const n = parseInt(adding.trim())
    if (!isNaN(n) && n > 0 && n <= 200 && !windows.includes(n)) {
      onChange([...windows, n].sort((a, b) => a - b))
    }
    setAdding("")
  }

  return (
    <div className="flex flex-wrap gap-1 ml-6 mb-1.5">
      {windows.map(w => (
        <span key={w} className="flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[11px] text-indigo-700">
          {w}
          <button
            type="button"
            onClick={() => onChange(windows.filter(x => x !== w))}
            className="text-indigo-400 hover:text-indigo-700 transition"
            aria-label={`Remove window ${w}`}
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={adding}
        onChange={e => setAdding(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add() } }}
        onBlur={add}
        placeholder="+ window"
        className="w-20 rounded border border-dashed border-slate-300 bg-transparent px-1.5 py-0.5 text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
      />
    </div>
  )
}

export default function StrategyEditor({ data, onChange, stock, period, options, panel, onFeatureAnalysis }) {
  const showFeatures = !panel || panel === "features"
  const showAlgorithm = !panel || panel === "algorithm"

  const [collapsedSections, setCollapsedSections] = useState({})
  const [search, setSearch] = useState("")
  const [analysis, setAnalysis] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [analyzeFullDataset, setAnalyzeFullDataset] = useState(false)
  const [ranAt, setRanAt] = useState(null)
  const [enabledHyperparams, setEnabledHyperparams] = useState({})

  const isHyperparamEnabled = (algo, key) => enabledHyperparams[algo]?.[key] !== false

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

  const toggleSection = (section) => setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))

  const resolveConfig = (key, config) => ({
    ...config,
    hasWindows: !!apiFeatures[key],
    defaultWindows: config.defaultWindows || [20],
  })

  const toggleFeature = (key, config) => {
    const eff = resolveConfig(key, config)
    const updated = { ...features }
    if (updated[key] !== undefined) delete updated[key]
    else updated[key] = eff.hasWindows ? [...eff.defaultWindows] : true
    onChange({ ...data, features: updated })
  }

  const setWindows = (key, windows) => {
    const updated = { ...features }
    if (windows.length === 0) delete updated[key]
    else updated[key] = windows
    onChange({ ...data, features: updated })
  }

  const toggleFullDataset = (checked) => {
    onChange({ ...data, features: checked ? getFullDatasetFeatures() : {} })
  }

  const isFullDataset = () => {
    const fullKeys = Object.keys(getFullDatasetFeatures())
    const currentKeys = Object.keys(features)
    return fullKeys.length === currentKeys.length && fullKeys.every(k => features[k] !== undefined)
  }

  const selectAllSection = (sectionFeatures, select) => {
    const updated = { ...features }
    for (const [key, config] of Object.entries(sectionFeatures)) {
      if (select) {
        const eff = resolveConfig(key, config)
        updated[key] = eff.hasWindows ? [...eff.defaultWindows] : true
      } else delete updated[key]
    }
    onChange({ ...data, features: updated })
  }

  const handleAlgorithmChange = (algo) => {
    onChange({ ...data, model_type: algo, hyperparameters: getDefaultHyperparams(algo) })
  }

  const handleHyperparamChange = (key, value) => {
    onChange({ ...data, hyperparameters: { ...hyperparameters, [key]: value } })
  }

  const toggleOptimize = (checked) => onChange({ ...data, optimize_hyperparameters: checked })

  const analysisPayload = () => ({
    stock,
    period,
    model_type: data.model_type,
    features: analyzeFullDataset ? getFullDatasetFeatures() : features,
    full_dataset: false,
    target: data.target,
    sampling: data.sampling,
  })

  const runKind = async (kind) => {
    const res = await modelsApi.featureAnalysis({ ...analysisPayload(), kind })
    return res?.data ?? res
  }

  const runAnalysis = async () => {
    setAnalysisLoading(true)
    setAnalysisError(null)
    try {
      const payload = analysisPayload()

      const [mutualResult, correlationResult] = await Promise.all([
        modelsApi.featureAnalysis({ ...payload, kind: "mutual_information" }),
        modelsApi.featureAnalysis({ ...payload, kind: "correlation_matrix" }),
      ])

      const raw = {
        mutual_info: mutualResult?.data ?? mutualResult,
        correlations: correlationResult?.data ?? correlationResult,
      }
      const parsed = parseAnalysis(raw)
      parsed.rawText = typeof raw.mutual_info === "string" ? raw.mutual_info : JSON.stringify(raw, null, 2)

      setAnalysis(parsed)
      setRanAt(new Date().toLocaleTimeString())
      if (onFeatureAnalysis) onFeatureAnalysis(parsed)
    } catch (err) {
      setAnalysisError(err.message)
    } finally {
      setAnalysisLoading(false)
    }
  }

  const miByFeature = useMemo(() => {
    const map = {}
    for (const m of analysis?.mi || []) {
      const key = columnToFeature(m.column)
      if (!key) continue
      if (!map[key] || m.net > map[key].net) map[key] = m
    }
    return map
  }, [analysis])

  const redundantFeatures = useMemo(() => {
    const set = new Set()
    for (const p of analysis?.pairs || []) {
      const a = columnToFeature(p.a)
      const b = columnToFeature(p.b)
      if (a) set.add(a)
      if (b) set.add(b)
    }
    return set
  }, [analysis])

  const featureCount = Object.keys(features).length
  const columnCount = Object.values(features).reduce(
    (n, v) => n + (Array.isArray(v) ? v.length : 1), 0
  )
  const totalAvailable = Object.values(FEATURE_CATALOG)
    .reduce((n, sec) => n + Object.keys(sec).filter(k => k in apiFeatures).length, 0)

  const q = search.trim().toLowerCase()

  const featurePicker = (
    <div className="space-y-2">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-2.5 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search features..."
          className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          <b className="text-slate-900">{featureCount}</b> of {totalAvailable} selected · {columnCount} columns
        </span>
        <span className="flex gap-3">
          <button
            type="button"
            onClick={() => toggleFullDataset(!isFullDataset())}
            className="text-indigo-600 hover:text-indigo-800 transition"
          >
            {isFullDataset() ? "Deselect all" : "Full dataset"}
          </button>
          {featureCount > 0 && (
            <button
              type="button"
              onClick={() => onChange({ ...data, features: {} })}
              className="text-slate-500 hover:text-slate-800 transition"
            >
              Clear
            </button>
          )}
        </span>
      </div>

      {Object.entries(FEATURE_CATALOG).map(([sectionName, sectionFeaturesAll]) => {
        const sectionFeatures = Object.fromEntries(
          Object.entries(sectionFeaturesAll)
            .filter(([key]) => key in apiFeatures)
            .filter(([key, cfg]) => !q || key.toLowerCase().includes(q) || cfg.label.toLowerCase().includes(q))
        )
        if (Object.keys(sectionFeatures).length === 0) return null

        const collapsed = collapsedSections[sectionName]
        const selectedCount = Object.keys(sectionFeatures).filter(k => features[k] !== undefined).length
        const totalCount = Object.keys(sectionFeatures).length

        return (
          <div key={sectionName} className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between w-full px-3 py-2 bg-slate-50">
              <button
                type="button"
                onClick={() => toggleSection(sectionName)}
                className="flex items-center gap-2 text-left flex-1"
              >
                {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                <span className="text-sm font-medium text-slate-900">{sectionName}</span>
                <span className="text-xs text-slate-500">{selectedCount}/{totalCount}</span>
              </button>
              <div className="flex gap-1 text-xs">
                <button type="button" onClick={() => selectAllSection(sectionFeatures, true)} className="text-indigo-600 hover:text-indigo-800 px-1">All</button>
                <span className="text-slate-300">|</span>
                <button type="button" onClick={() => selectAllSection(sectionFeatures, false)} className="text-indigo-600 hover:text-indigo-800 px-1">None</button>
              </div>
            </div>

            {!collapsed && (
              <div className="px-3 py-2">
                {Object.entries(sectionFeatures).map(([key, config]) => {
                  const eff = resolveConfig(key, config)
                  const isEnabled = features[key] !== undefined
                  const mi = miByFeature[key]
                  return (
                    <div key={key}>
                      <div className="flex items-center gap-2 py-1">
                        <label className="flex items-center gap-2 cursor-pointer group flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => toggleFeature(key, config)}
                            className="accent-indigo-500 flex-shrink-0"
                          />
                          <span className={`text-sm truncate ${isEnabled ? "text-slate-900" : "text-slate-500"}`}>
                            {config.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 hidden group-hover:inline truncate">
                            {key}
                          </span>
                        </label>
                        <span className="flex items-center gap-1.5 flex-shrink-0">
                          {isEnabled && redundantFeatures.has(key) && (
                            <AlertTriangle size={12} className="text-amber-500" />
                          )}
                          {mi && (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              mi.conf ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                            }`}>
                              {mi.conf ? `MI ${mi.net.toFixed(3)}` : "noise"}
                            </span>
                          )}
                          <span title={config.description} className="text-slate-400 hover:text-slate-600 cursor-help">
                            <Info size={12} />
                          </span>
                        </span>
                      </div>
                      {isEnabled && eff.hasWindows && (
                        <WindowChips
                          windows={Array.isArray(features[key]) ? features[key] : []}
                          onChange={w => setWindows(key, w)}
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
    </div>
  )

  const algorithmPanel = (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">Algorithm & Hyperparameters</h3>

      <div>
        <label className="block text-xs text-slate-500 mb-2">Algorithm</label>
        <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200">
          {modelTypes.map(algo => {
            const isActive = data.model_type === algo
            return (
              <div
                key={algo}
                onClick={() => { if (!isActive) handleAlgorithmChange(algo) }}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer transition ${
                  isActive ? "bg-indigo-50" : "hover:bg-slate-50"
                }`}
              >
                <span className={`text-sm ${isActive ? "text-slate-900 font-medium" : "text-slate-600"}`}>{algo}</span>
                <Toggle checked={isActive} onChange={() => { if (!isActive) handleAlgorithmChange(algo) }} ariaLabel={`Select ${algo}`} />
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.optimize_hyperparameters || false}
            onChange={e => toggleOptimize(e.target.checked)}
            className="accent-indigo-500"
          />
          <div>
            <span className="text-sm text-slate-800 flex items-center gap-1">
              <Zap size={14} className="text-amber-500" />
              Auto-optimize (GridSearchCV)
            </span>
            {data.optimize_hyperparameters && (
              <p className="text-xs text-slate-500 mt-1">
                Hyperparameters will be automatically optimized during training
              </p>
            )}
          </div>
        </label>
      </div>

      <div className={`space-y-3 transition-opacity ${data.optimize_hyperparameters ? "opacity-40 pointer-events-none" : ""}`}>
        {ALGORITHM_HYPERPARAMS[data.model_type] &&
          Object.entries(ALGORITHM_HYPERPARAMS[data.model_type]).map(([key, config]) => {
            const enabled = isHyperparamEnabled(data.model_type, key)
            const inputDisabled = data.optimize_hyperparameters || !enabled
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-xs ${enabled ? "text-slate-600" : "text-slate-400"}`}>{config.label}</label>
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
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {config.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  />
                )}
              </div>
            )
          })
        }
      </div>
    </div>
  )

  if (showFeatures && !showAlgorithm) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,38%)_1fr] gap-5">
        <div className="lg:border-r lg:border-slate-200 lg:pr-5">{featurePicker}</div>
        <AnalysisPanel
          analysis={analysis}
          loading={analysisLoading}
          error={analysisError}
          scope={analyzeFullDataset}
          onScopeChange={setAnalyzeFullDataset}
          onRun={runAnalysis}
          onRunKind={runKind}
          canRun={analyzeFullDataset || featureCount > 0}
          ranAt={ranAt}
        />
      </div>
    )
  }

  if (showAlgorithm && !showFeatures) return algorithmPanel

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {featurePicker}
      {algorithmPanel}
    </div>
  )
}
