import { useParams, useNavigate  } from "react-router-dom"
import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { modelsApi } from "../../api.js"
import StrategyEditor from "../../components/wizard/StrategyEditor.jsx"
import { getDefaultHyperparams } from "../../constants/algorithmConfig.js"

export default function Model() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Strategy editor state
  const [showStrategy, setShowStrategy] = useState(false)
  const [strategyData, setStrategyData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [training, setTraining] = useState(false)
  const [strategyTab, setStrategyTab] = useState("features")

  const [options, setOptions] = useState(null)

  const loadModel = () => {
    modelsApi.read(id)
      .then(data => {
        setModel(data)
        setStrategyData({
          model_type: data.model_type,
          features: data.features || {},
          hyperparameters: data.hyperparameters || getDefaultHyperparams(data.model_type),
          optimize_hyperparameters: data.optimize_hyperparameters || false,
          target: data.target,
          sampling: data.sampling,
        })
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadModel() }, [id])

  useEffect(() => {
    modelsApi.getOptions().then(setOptions).catch(err => console.error("Failed to load options:", err))
  }, [])

  const handleDelete = async () => {
    try {
      await modelsApi.delete(id)
      navigate("/app/models")
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSaveStrategy = async () => {
    setSaving(true)
    try {
      await modelsApi.modify(id, {
        name: model.name,
        description: model.description,
        model_type: strategyData.model_type,
        features: strategyData.features,
        hyperparameters: strategyData.hyperparameters,
        optimize_hyperparameters: strategyData.optimize_hyperparameters,
        target: strategyData.target,
        sampling: strategyData.sampling,
      })
      setShowStrategy(false)
      loadModel()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleTrain = async () => {
    setTraining(true)
    try {
      await modelsApi.train(id)
      alert("Training completed successfully")
    } catch (err) {
      alert("Training error: " + err.message)
    } finally {
      setTraining(false)
    }
  }

  if (loading) return <div className="text-slate-400">Loading model...</div>
  if (error) return <div className="text-red-400">Error: {error}</div>
  if (!model) return <div className="text-center text-slate-400">Model not found</div>

  const featureCount = model.features ? Object.keys(model.features).length : 0
  const hasStrategy = featureCount > 0
  return (
    <div className="space-y-8">

      {/* header section */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {model.name}
          </h1>
          <p className="mt-2 text-slate-400">
            {model.description}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowStrategy(true)}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            Modify Strategy
          </button>
          {hasStrategy && (
            <button
              onClick={handleTrain}
              disabled={training}
              className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {training && <Loader2 size={14} className="animate-spin" />}
              Train Model
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
          >
            Delete Model
          </button>
        </div>
      </section>

      {/* model details section */}
      <section className="rounded-lg border border-indigo-800 bg-indigo-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-slate-100">
          Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
          <div>
            <p className="font-medium text-slate-300">model id:</p>
            <p>{model.id}</p>
          </div>
          <div>
            <p className="font-medium text-slate-300">stock:</p>
            <p>{model.stock}</p>
          </div>
          <div>
            <p className="font-medium text-slate-300">model type:</p>
            <p>{model.model_type}</p>
          </div>
          <div>
            <p className="font-medium text-slate-300">period:</p>
            <p>{model.period} days</p>
          </div>
          <div>
            <p className="font-medium text-slate-300">created at:</p>
            <p>{model.createdAt ? new Date(model.createdAt).toLocaleDateString() : ""}</p>
          </div>
        </div>
      </section>
      {/* Strategy section */}
      <section className="rounded-lg border border-indigo-800 bg-indigo-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-slate-100">Strategy</h2>
        {hasStrategy ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
            <div>
              <p className="font-medium text-slate-300">algorithm:</p>
              <p>{model.model_type}</p>
            </div>
            <div>
              <p className="font-medium text-slate-300">features:</p>
              <p>{featureCount} selected</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {Object.keys(model.features).map(key => (
                  <span key={key} className="px-2 py-0.5 text-xs bg-indigo-800 rounded border border-indigo-700 text-slate-300">
                    {key}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium text-slate-300">auto-optimize:</p>
              <p>{model.optimize_hyperparameters ? "Enabled (GridSearchCV)" : "Disabled"}</p>
            </div>
            {model.hyperparameters && !model.optimize_hyperparameters && (
              <div>
                <p className="font-medium text-slate-300">hyperparameters:</p>
                <div className="mt-1 space-y-1">
                  {Object.entries(model.hyperparameters).map(([k, v]) => (
                    <p key={k} className="text-xs"><span className="text-slate-300">{k}:</span> {String(v)}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No strategy configured yet. Click "Modify Strategy" to set up features and algorithm.</p>
        )}
      </section>

      {/* Strategy Editor Modal */}
      {showStrategy && strategyData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className={`bg-[#1e1b2e] rounded-xl shadow-2xl w-full max-h-[92vh] flex flex-col border border-indigo-800 ${
            strategyTab === "features" ? "max-w-[1400px]" : "max-w-4xl"
          }`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-800">
              <div className="flex items-center gap-5">
                <h2 className="text-lg font-semibold text-slate-100">Modify Strategy</h2>
                <div className="flex rounded-md border border-indigo-700 overflow-hidden text-xs">
                  {["features", "algorithm"].map(t => (
                    <button
                      key={t}
                      onClick={() => setStrategyTab(t)}
                      className={`px-3 py-1.5 capitalize transition ${
                        strategyTab === t ? "bg-indigo-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowStrategy(false)} className="text-slate-400 hover:text-slate-200 transition">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!options ? (
                <div className="py-10 text-center text-sm text-slate-400">Loading options...</div>
              ) : (
                <StrategyEditor
                  data={strategyData}
                  onChange={setStrategyData}
                  stock={model.stock}
                  period={model.period}
                  options={options}
                  panel={strategyTab}
                />
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-indigo-800">
              <button
                onClick={() => setShowStrategy(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStrategy}
                disabled={saving}
                className="px-6 py-2 text-sm bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save Strategy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}