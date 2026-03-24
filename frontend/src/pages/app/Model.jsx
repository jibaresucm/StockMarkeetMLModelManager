import { useParams, useNavigate  } from "react-router-dom"
import { useState, useEffect } from "react"
import { modelsApi } from "../../api.js"

export default function Model() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    modelsApi.read(id)
      .then(data => setModel(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    try {
      await modelsApi.delete(id)
      navigate("/app/models")
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="text-slate-400">Loading model...</div>
  if (error) return <div className="text-red-400">Error: {error}</div>
  if (!model) return <div className="text-center text-slate-400">Model not found</div>

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

        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
        >
          Delete Model
        </button>
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
    </div>
  )
}