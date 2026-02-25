import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { projectsApi, modelsApi } from "../../api.js"

export default function Project() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allModels, setAllModels] = useState([])
  const [selectedModelId, setSelectedModelId] = useState("")
  const [linkError, setLinkError] = useState(null)

  const loadData = () => {
    setLoading(true)
    Promise.all([
      projectsApi.read(id),
      projectsApi.getModels(id).catch(err => {
        if (err.message && err.message.includes("does not have any models")) return []
        throw err
      }),
      modelsApi.readAll().catch(() => []),
    ])
      .then(([projectData, linkedModels, userModels]) => {
        setProject(projectData)
        setModels(linkedModels)
        setAllModels(Array.isArray(userModels) ? userModels : [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [id])

  const handleDelete = async () => {
    try {
      await projectsApi.delete(id)
      navigate("/app/projects")
    } catch (err) {
      alert(err.message)
    }
  }

  const handleLinkModel = async (e) => {
    e.preventDefault()
    setLinkError(null)
    if (!selectedModelId) return
    try {
      await projectsApi.linkModel(id, parseInt(selectedModelId))
      setSelectedModelId("")
      loadData()
    } catch (err) {
      setLinkError(err.message)
    }
  }

  if (loading) return <div className="text-slate-400">Loading project...</div>
  if (error) return <div className="text-red-400">Error: {error}</div>
  if (!project) return <div className="text-center text-slate-400">Project not found</div>

  // Models not yet linked to this project
  const linkedIds = new Set(models.map(m => m.id))
  const availableModels = allModels.filter(m => !linkedIds.has(m.id))

  return (
    <div className="space-y-8">

      {/* header section */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {project.name}
          </h1>
          <p className="mt-2 text-slate-400">
            {project.description}
          </p>
        </div>

        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
        >
          Delete Project
        </button>
      </section>

      {/* project details section */}
      <section className="rounded-lg border border-indigo-800 bg-indigo-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-slate-100">
          Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
          <div>
            <p className="font-medium text-slate-300">project id:</p>
            <p>{project.id}</p>
          </div>
          <div>
            <p className="font-medium text-slate-300">created at:</p>
            <p>{project.created_at ? new Date(project.created_at).toLocaleDateString() : ""}</p>
          </div>
        </div>
      </section>

      {/* link model section */}
      {availableModels.length > 0 && (
        <section className="rounded-lg border border-indigo-700 bg-indigo-900 p-6 space-y-3">
          <h2 className="text-lg font-medium text-slate-100">Link a Model</h2>
          {linkError && <p className="text-red-400 text-sm">{linkError}</p>}
          <form onSubmit={handleLinkModel} className="flex gap-3">
            <select
              value={selectedModelId}
              onChange={e => setSelectedModelId(e.target.value)}
              className="flex-1 border border-indigo-700 bg-indigo-800 px-3 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a model...</option>
              {availableModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition"
            >
              Link
            </button>
          </form>
        </section>
      )}

      {/* models list section */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-slate-100">
          Models
        </h2>
        {models.length === 0 ? (
          <div className="rounded-lg border border-dashed border-indigo-800 p-10 text-center">
            <p className="text-slate-400">no models associated with this project yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((model) => (
              <Link to={`/app/models/${model.id}`} key={model.id} className="block">
                <div className="rounded-lg border border-indigo-800 bg-indigo-900 p-4 hover:border-indigo-700 transition cursor-pointer">
                  <h3 className="text-base font-medium text-slate-100">{model.name}</h3>
                  <p className="mt-1 text-sm text-slate-300">{model.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}