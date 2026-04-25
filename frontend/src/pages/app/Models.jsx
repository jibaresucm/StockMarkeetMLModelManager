import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { modelsApi } from "../../api.js"
import ModelWizard from "../../components/wizard/ModelWizard.jsx"

export default function Models() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showWizard, setShowWizard] = useState(false)

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

  if (loading) return <div className="text-slate-400">Loading models...</div>
  if (error) return <div className="text-red-400">Error: {error}</div>

  return (
    <div className="space-y-8">

      {/* header section */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Models
          </h1>
          <p className="mt-2 text-slate-400">
            Manage your machine learning models and track their performance.
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
        >
          New Model
        </button>
      </section>

      {/* Model creation wizard */}
      {showWizard && (
        <ModelWizard
          onClose={() => setShowWizard(false)}
          onCreated={() => { setShowWizard(false); loadModels() }}
        />
      )}

      {/* Empty state */}
      {models.length === 0 && <EmptyState onNew={() => setShowWizard(true)} />}

      <div className="flex flex-col gap-2">

        {/* HEADER */}
        <div className="flex text-xs text-slate-400 px-4">
          <span className="w-1/5">Model</span>
          {/* <span className="flex-1">Description</span> */}
          <span className="w-20">Stock</span>
          <span className="w-20">Type</span>
          <span className="w-20">Period</span>
          <span className="w-28">Date creation</span>
          <span className="w-20 text-right">Actions</span>
        </div>

        {/* LIST */}
        <section className="flex flex-col gap-3">
          {models.map(model => (
            <ModelListItem key={model.id} model={model} onDelete={handleDelete} />
          ))}
        </section>

      </div>
    </div>
  )
}

function ModelListItem({ model, onDelete }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-800 bg-indigo-700 hover:bg-indigo-800 transition-all">
      
      <Link to={`/app/models/${model.id}`} className="flex-1 min-w-0">
        <div className="flex items-center w-full">

          <span className="w-1/4 font-medium text-slate-100 truncate">
            {model.name}
          </span>

          <span className="w-20 text-sm text-slate-300">
            {model.stock}
          </span>

          <span className="w-20 text-sm text-slate-300">
            {model.model_type}
          </span>

          <span className="w-20 text-sm text-slate-300">
            {model.period}d
          </span>

          <span className="w-28 text-xs text-slate-300">
            {new Date(model.createdAt).toLocaleDateString()}
          </span>

          <span className="w-20 text-right">
            <button
              onClick={() => onDelete(model.id)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Delete
            </button>
          </span>

        </div>
      </Link>



    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div className="rounded-lg border border-dashed border-indigo-800 p-10 text-center">
      <h2 className="text-lg font-medium text-slate-100">
        No models yet
      </h2>

      <p className="mt-2 text-slate-400">
        Create your first model to start making predictions.
      </p>

      <div className="mt-6 flex justify-center">
        <button
          onClick={onNew}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
        >
          Create model
        </button>
      </div>
    </div>
  )
}