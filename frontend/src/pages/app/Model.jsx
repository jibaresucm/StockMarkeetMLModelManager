import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { X, Loader2, Zap, TrendingUp, TrendingDown, Sliders, BarChart3 } from "lucide-react"
import { modelsApi } from "../../api.js"
import Button from "../../components/Button.jsx"
import { Metric, ConfusionMatrix } from "../../components/ProjectReport.jsx"
import StrategyEditor from "../../components/wizard/StrategyEditor.jsx"
import { getDefaultHyperparams } from "../../constants/algorithmConfig.js"

const pct = (v) => (typeof v === "number" ? `${(v * 100).toFixed(1)}%` : "—")

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

  // metricas del entrenamiento y prediccion
  const [stats, setStats] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [predictError, setPredictError] = useState(null)

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

  const loadStats = () => {
    modelsApi.stats(id)
      .then(res => setStats(res.trained ? res.stats : null))
      .catch(() => setStats(null))
  }

  useEffect(() => { loadModel(); loadStats() }, [id])

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
    if (training) return
    setTraining(true)
    try {
      await modelsApi.train(id)
      setPrediction(null)
      loadStats()
    } catch (err) {
      alert("Training error: " + err.message)
    } finally {
      setTraining(false)
    }
  }

  const handlePredict = async () => {
    if (predicting) return
    setPredicting(true)
    setPredictError(null)
    try {
      const res = await modelsApi.predict(id)
      setPrediction(res.data)
    } catch (err) {
      setPredictError(err.message)
    } finally {
      setPredicting(false)
    }
  }

  if (loading) return <div className="text-slate-500">Loading model...</div>
  if (error) return <div className="text-red-600">Error: {error}</div>
  if (!model) return <div className="text-center text-slate-500">Model not found</div>

  const featureCount = model.features ? Object.keys(model.features).length : 0
  const hasStrategy = featureCount > 0

  return (
    <div className="space-y-8">

      {/* header section */}
      <section className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {model.name}
          </h1>
          <p className="mt-2 text-slate-600">
            {model.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => setShowStrategy(true)}>
            <Sliders size={16} />
            Modify Strategy
          </Button>
          {hasStrategy && (
            <Button variant="success" size="sm" onClick={handleTrain} disabled={training}>
              {training ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
              {training ? "Training..." : "Train Model"}
            </Button>
          )}

          {stats && (
            <Button size="sm" onClick={handlePredict} disabled={predicting}>
              {predicting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {predicting ? "Predicting..." : "Run Prediction"}
            </Button>
          )}

          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </section>

      {/* prediccion */}
      {predictError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {predictError}
        </div>
      )}

      {prediction && <PredictionCard prediction={prediction} />}

      {/* model details section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Details
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Detail label="model id" value={model.id} />
          <Detail label="stock" value={model.stock} />
          <Detail label="model type" value={model.model_type} />
          <Detail label="period" value={`${model.period} days`} />
          <Detail label="target" value={model.target} />
          <Detail
            label="created at"
            value={model.createdAt ? new Date(model.createdAt).toLocaleDateString() : ""}
          />
        </div>
      </section>

      {/* metricas del entrenamiento */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Performance</h2>

        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-3 content-start">
              <Metric label="Accuracy" value={pct(stats.accuracy)} />
              <Metric label="Prec. up" value={pct(stats.precision_up)} />
              <Metric label="Prec. down" value={pct(stats.precision_down)} />
              <Metric label="Recall up" value={pct(stats.recall_up)} />
              <Metric label="Recall down" value={pct(stats.recall_down)} />
            </div>

            <ConfusionMatrix matrix={stats.confusion_matrix} />
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            This model has not been trained yet. Train it to see accuracy, precision, recall and the
            confusion matrix.
          </p>
        )}
      </section>

      {/* Strategy section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Strategy</h2>
        {hasStrategy ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <Detail label="algorithm" value={model.model_type} />
              <Detail label="sampling" value={model.sampling} />
              <Detail
                label="auto-optimize"
                value={model.optimize_hyperparameters ? "Enabled (GridSearchCV)" : "Disabled"}
              />
              {model.hyperparameters && !model.optimize_hyperparameters && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">hyperparameters</p>
                  <div className="mt-1 space-y-0.5">
                    {Object.entries(model.hyperparameters).map(([k, v]) => (
                      <p key={k} className="text-xs text-slate-600">
                        <span className="font-medium text-slate-700">{k}:</span> {String(v)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                features · {featureCount} selected
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.keys(model.features).map(key => (
                  <span
                    key={key}
                    className="px-2 py-0.5 text-xs rounded-full border border-slate-200 bg-slate-50 text-slate-600"
                  >
                    {key}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No strategy configured yet. Click "Modify Strategy" to set up features and algorithm.</p>
        )}
      </section>

      {/* Strategy Editor Modal */}
      {showStrategy && strategyData && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`bg-white rounded-xl shadow-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 ${
            strategyTab === "features" ? "max-w-[1400px]" : "max-w-4xl"
          }`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-5">
                <h2 className="text-lg font-semibold text-slate-900">Modify Strategy</h2>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                  {["features", "algorithm"].map(t => (
                    <button
                      key={t}
                      onClick={() => setStrategyTab(t)}
                      className={`px-3 py-1.5 capitalize transition ${
                        strategyTab === t ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowStrategy(false)} className="text-slate-400 hover:text-slate-700 transition">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!options ? (
                <div className="py-10 text-center text-sm text-slate-500">Loading options...</div>
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
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <Button variant="secondary" size="sm" onClick={() => setShowStrategy(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveStrategy} disabled={saving}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save Strategy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PredictionCard({ prediction }) {
  const up = prediction.prediction === 1

  return (
    <section className={`rounded-xl border p-6 shadow-sm ${
      up ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className={`flex h-12 w-12 items-center justify-center rounded-full ${
            up ? "bg-emerald-100" : "bg-red-100"
          }`}>
            {up
              ? <TrendingUp size={22} className="text-emerald-700" />
              : <TrendingDown size={22} className="text-red-700" />}
          </span>

          <div>
            <p className={`text-xl font-bold ${up ? "text-emerald-700" : "text-red-700"}`}>
              {prediction.ticker} will go {up ? "UP" : "DOWN"}
            </p>
            <p className="text-sm text-slate-600">
              Prediction for {prediction.date}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold text-slate-900">{prediction.confidence}%</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">confidence</p>
        </div>
      </div>
    </section>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  )
}
