import { useState, useEffect } from "react"
import { X, CheckCircle, XCircle, Loader2 } from "lucide-react"
import StepIndicator from "./StepIndicator"
import StrategyEditor from "./StrategyEditor"
import { modelsApi } from "../../api"
import { getDefaultHyperparams } from "../../constants/algorithmConfig"

export default function ModelWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(0)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  // Options fetched from the backend (which proxies to the Python FastAPI server)
  const [options, setOptions] = useState(null)
  const [optionsError, setOptionsError] = useState(null)

  // Ticker validation state
  const [tickerLoading, setTickerLoading] = useState(false)
  const [tickerChecked, setTickerChecked] = useState(false)

  const [wizardData, setWizardData] = useState({
    name: "",
    description: "",
    stock: "",
    period: 500,
    tickerValid: false,
    model_type: "RandomForestClassifier",
    target: "",
    sampling: "",
    features: {},
    hyperparameters: getDefaultHyperparams("RandomForestClassifier"),
    optimize_hyperparameters: false,
  })

  const update = (changes) => setWizardData(prev => ({ ...prev, ...changes }))

  // Fetch options on mount
  useEffect(() => {
    modelsApi.getOptions()
      .then(setOptions)
      .catch(err => setOptionsError(err.message))
  }, [])

  // Default target/sampling once options load
  useEffect(() => {
    if (!options) return
    setWizardData(prev => ({
      ...prev,
      target: prev.target || options.targets[0] || "",
      sampling: prev.sampling || options.sampling_methods[0] || "",
    }))
  }, [options])

  // Validation per step
  const canNext = () => {
    if (step === 0) return wizardData.name.trim() !== ""
    if (step === 1) return wizardData.stock.trim() !== "" && wizardData.tickerValid && wizardData.period > 0
    if (step === 2) return wizardData.target && wizardData.sampling && Object.keys(wizardData.features).length > 0
    return false
  }

  // Ticker validation
  const validateTicker = async () => {
    setTickerLoading(true)
    setTickerChecked(false)
    setError(null)
    try {
      const result = await modelsApi.validateTicker(wizardData.stock)
      update({ tickerValid: result.valid })
      setTickerChecked(true)
      if (!result.valid) setError("Invalid ticker. Please check the symbol and try again.")
    } catch (err) {
      update({ tickerValid: false })
      setTickerChecked(true)
      setError(err.message)
    } finally {
      setTickerLoading(false)
    }
  }

  // Handle ticker text change - reset validation
  const handleTickerChange = (value) => {
    update({ stock: value.toUpperCase(), tickerValid: false })
    setTickerChecked(false)
    setError(null)
  }

  // Create model
  const handleCreate = async () => {
    setCreating(true)
    setError(null)
    try {
      const { tickerValid, ...modelData } = wizardData
      await modelsApi.create(modelData)
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    const hasData = wizardData.name || wizardData.stock || Object.keys(wizardData.features).length > 0
    if (hasData) {
      if (!window.confirm("You have unsaved data. Are you sure you want to close the wizard?")) return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#1e1b2e] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-indigo-800">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h2 className="text-lg font-semibold text-slate-100">Create New Model</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-200 transition">
            <X size={20} />
          </button>
        </div>

        <StepIndicator currentStep={step} />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {optionsError && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">
              Failed to load options from server: {optionsError}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">
              {error}
            </div>
          )}

          {!options && !optionsError && (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-400 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading options...
            </div>
          )}

          {options && (
            <>
              {/* Step 0: Name & Description */}
              {step === 0 && (
                <div className="space-y-4 max-w-lg mx-auto">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Model Name *</label>
                    <input
                      value={wizardData.name}
                      onChange={e => update({ name: e.target.value })}
                      placeholder="e.g. AAPL Trend Predictor"
                      className="w-full border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Description</label>
                    <textarea
                      value={wizardData.description}
                      onChange={e => update({ description: e.target.value })}
                      placeholder="Optional description of the model's purpose..."
                      rows={3}
                      className="w-full border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Ticker & Period */}
              {step === 1 && (
                <div className="space-y-4 max-w-lg mx-auto">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Stock Ticker *</label>
                    <div className="flex gap-2">
                      <input
                        value={wizardData.stock}
                        onChange={e => handleTickerChange(e.target.value)}
                        placeholder="e.g. AAPL"
                        className="flex-1 border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={validateTicker}
                        disabled={!wizardData.stock.trim() || tickerLoading}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {tickerLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                        Validate
                      </button>
                    </div>
                    {/* Validation feedback */}
                    {tickerChecked && (
                      <div className={`flex items-center gap-2 mt-2 text-sm ${wizardData.tickerValid ? "text-green-400" : "text-red-400"}`}>
                        {wizardData.tickerValid
                          ? <><CheckCircle size={16} /> Ticker is valid</>
                          : <><XCircle size={16} /> Ticker not found</>
                        }
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Period (days) *</label>
                    <input
                      type="number"
                      value={wizardData.period}
                      onChange={e => update({ period: parseInt(e.target.value) || 0 })}
                      placeholder="e.g. 500"
                      min={30}
                      className="w-full border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Number of trading days to use for training data</p>
                  </div>
                </div>
              )}

              {/* Step 2: Strategy */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Target & Sampling selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Target *</label>
                      <select
                        value={wizardData.target}
                        onChange={e => update({ target: e.target.value })}
                        className="w-full border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {options.targets.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Event Sampling *</label>
                      <select
                        value={wizardData.sampling}
                        onChange={e => update({ sampling: e.target.value })}
                        className="w-full border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {options.sampling_methods.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <StrategyEditor
                    data={wizardData}
                    onChange={setWizardData}
                    stock={wizardData.stock}
                    period={wizardData.period}
                    options={options}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-indigo-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => { setStep(s => s - 1); setError(null) }}
                className="px-4 py-2 text-sm border border-indigo-700 text-slate-300 rounded hover:bg-indigo-800 transition"
              >
                Back
              </button>
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={() => { setStep(s => s + 1); setError(null) }}
                disabled={!canNext() || !options}
                className="px-6 py-2 text-sm bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreate}
                disabled={!canNext() || creating}
                className="px-6 py-2 text-sm bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                Create Model
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
