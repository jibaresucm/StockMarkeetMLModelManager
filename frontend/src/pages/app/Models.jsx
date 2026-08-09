import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { BrainCircuit, Plus, Trash2 } from "lucide-react"
import Button from "../../components/Button.jsx"
import { modelsApi } from "../../api.js"
import ModelWizard from "../../components/wizard/ModelWizard.jsx"

export default function Models() {
  const location = useLocation()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showWizard, setShowWizard] = useState(!!location.state?.new)

  const loadModels = () => {
    setLoading(true)
    modelsApi.readAll()
      .then(list => { setModels(list); setError(null) })
      .catch(err => {
        // Service throws this when the user simply has no models yet
        if (err.message && err.message.includes("does not have any models")) {
          setModels([])
        } else {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadModels() }, [])

  const handleDelete = async (id) => {
    try {
      await modelsApi.delete(id)
      setModels(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="text-slate-500">Loading models...</div>
  if (error) return <div className="text-red-600">Error: {error}</div>

  return (
    <div className="space-y-8">

      {/* header section */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Models
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your machine learning models and track their performance.
          </p>
        </div>

        <Button onClick={() => setShowWizard(true)} size="sm">
          <Plus size={16} />
          New Model
        </Button>
      </section>

      {/* Model creation wizard */}
      {showWizard && (
        <ModelWizard
          onClose={() => setShowWizard(false)}
          onCreated={() => { setShowWizard(false); loadModels() }}
        />
      )}

      {/* Empty state */}
      {models.length === 0 ? (
        <EmptyState onNew={() => setShowWizard(true)} />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

          <div className="grid grid-cols-[1fr_5rem_12rem_5rem_7rem_4rem] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>Model</span>
            <span>Stock</span>
            <span>Type</span>
            <span>Period</span>
            <span>Created</span>
            <span className="text-right">Actions</span>
          </div>

          {models.map(model => (
            <ModelListItem key={model.id} model={model} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function ModelListItem({ model, onDelete }) {
  return (
    <div className="grid grid-cols-[1fr_5rem_12rem_5rem_7rem_4rem] gap-4 items-center px-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">

      <Link to={`/app/models/${model.id}`} className="font-medium text-slate-900 truncate hover:text-indigo-600 transition">
        {model.name}
      </Link>

      <span className="text-sm font-medium text-slate-700">
        {model.stock}
      </span>

      <span className="text-sm text-slate-600 truncate">
        {model.model_type}
      </span>

      <span className="text-sm text-slate-600">
        {model.period}d
      </span>

      <span className="text-xs text-slate-500">
        {new Date(model.createdAt).toLocaleDateString()}
      </span>

      <span className="text-right">
        <button
          onClick={() => onDelete(model.id)}
          title="Delete model"
          className="text-slate-400 hover:text-red-600 transition"
        >
          <Trash2 size={16} />
        </button>
      </span>

    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
        <BrainCircuit size={26} className="text-indigo-600" />
      </div>

      <h2 className="text-lg font-semibold text-slate-900">
        No models yet
      </h2>

      <p className="mt-2 text-slate-600">
        Create your first model to start making predictions.
      </p>

      <div className="mt-6 flex justify-center">
        <Button onClick={onNew} size="sm">Create model</Button>
      </div>
    </div>
  )
}