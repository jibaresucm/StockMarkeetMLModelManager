import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { modelsApi } from "../../api.js"

export default function Models() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "", stock: "", period: "", model_type: "" })
  const [formError, setFormError] = useState(null)

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

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(null)
    try {
      await modelsApi.create(formData)
      setShowForm(false)
      setFormData({ name: "", description: "", stock: "", period: "", model_type: "" })
      loadModels()
    } catch (err) {
      setFormError(err.message)
    }
  }

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
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
        >
          New Model
        </button>
      </section>

      {/* create form */}
      {showForm && (
        <section className="rounded-lg border border-indigo-700 bg-indigo-900 p-6 space-y-4">
          <h2 className="text-lg font-medium text-slate-100">Create New Model</h2>
          {formError && <p className="text-red-400 text-sm">{formError}</p>}
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input
              placeholder="Name *"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              className="border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              placeholder="Description"
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className="border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              placeholder="Stock ticker (e.g. AAPL) *"
              value={formData.stock}
              onChange={e => setFormData(p => ({ ...p, stock: e.target.value }))}
              className="border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              placeholder="Period in days (e.g. 30) *"
              type="number"
              value={formData.period}
              onChange={e => setFormData(p => ({ ...p, period: e.target.value }))}
              className="border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              placeholder="Model type (e.g. LSTM) *"
              value={formData.model_type}
              onChange={e => setFormData(p => ({ ...p, model_type: e.target.value }))}
              className="border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(null) }}
                className="px-4 py-2 border border-indigo-700 rounded text-slate-300 text-sm hover:bg-indigo-800 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* models list section */}
      {models.length === 0 ? (
        <EmptyState onNew={() => setShowForm(true)} />
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map(model => (
            <ModelCard key={model.id} model={model} onDelete={handleDelete} />
          ))}
        </section>
      )}

    </div>
  )
}

function ModelCard({ model, onDelete }) {
  return (
    <div className="rounded-lg border border-indigo-800 bg-indigo-900 p-6 hover:border-indigo-700 transition">
      <div className="flex items-start justify-between gap-4">
        <Link to={`/app/models/${model.id}`} className="flex-1 min-w-0">
          <h2 className="text-lg font-medium text-slate-100 truncate">
            {model.name}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {model.description}
          </p>
          <div className="mt-4 text-sm text-slate-400">
            {model.stock} · {model.model_type} · {model.period}d
          </div>
        </Link>
        <button
          onClick={() => onDelete(model.id)}
          className="text-red-400 hover:text-red-300 text-sm transition shrink-0"
        >
          Delete
        </button>
      </div>
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