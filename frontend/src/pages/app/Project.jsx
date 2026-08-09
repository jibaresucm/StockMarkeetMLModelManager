import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { FileText, Loader2, Link2, BrainCircuit } from "lucide-react"
import Button from "../../components/Button.jsx"
import ProjectReport from "../../components/ProjectReport.jsx"
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

  const [report, setReport] = useState(null)
  const [reporting, setReporting] = useState(false)
  const [reportError, setReportError] = useState(null)

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

  const handleReport = async () => {
    if (reporting) return
    setReporting(true)
    setReportError(null)
    try {
      const data = await projectsApi.generateReport(id)
      setReport(data)
    } catch (err) {
      setReportError(err.message)
    } finally {
      setReporting(false)
    }
  }

  if (loading) return <div className="text-slate-500">Loading project...</div>
  if (error) return <div className="text-red-600">Error: {error}</div>
  if (!project) return <div className="text-center text-slate-500">Project not found</div>

  // Models not yet linked to this project
  const linkedIds = new Set(models.map(m => m.id))
  const availableModels = allModels.filter(m => !linkedIds.has(m.id))

  return (
    <div className="space-y-8">

      {/* header section */}
      <section className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {project.name}
          </h1>
          <p className="mt-2 text-slate-600">
            {project.description}
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <Button onClick={handleReport} disabled={reporting || models.length === 0} size="sm">
            {reporting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {reporting ? "Generating..." : "Generate Report"}
          </Button>

          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete Project
          </Button>
        </div>
      </section>

      {/* project details section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Detail label="project id" value={project.id} />
          <Detail label="models" value={models.length} />
          <Detail
            label="created at"
            value={project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ""}
          />
        </div>
      </section>

      {/* reporte */}
      {(reporting || reportError || report) && (
        <section className="space-y-4">
          {reporting && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
              <Loader2 size={18} className="animate-spin text-indigo-600" />
              Predicting with every model and asking the LLM for the analysis, this takes a while...
            </div>
          )}

          {reportError && !reporting && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {reportError}
            </div>
          )}

          {report && !reporting && <ProjectReport report={report} />}
        </section>
      )}

      {/* link model section */}
      {availableModels.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Link2 size={18} className="text-indigo-600" />
            Link a Model
          </h2>
          {linkError && <p className="text-red-600 text-sm">{linkError}</p>}
          <form onSubmit={handleLinkModel} className="flex gap-3">
            <select
              value={selectedModelId}
              onChange={e => setSelectedModelId(e.target.value)}
              className="flex-1 border border-slate-300 px-3 py-2 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a model...</option>
              {availableModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <Button type="submit" size="sm">Link</Button>
          </form>
        </section>
      )}

      {/* models list section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Models
        </h2>
        {models.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-slate-500">No models associated with this project yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((model) => (
              <Link to={`/app/models/${model.id}`} key={model.id} className="block">
                <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 shrink-0">
                      <BrainCircuit size={16} className="text-indigo-600" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">{model.name}</h3>
                      <p className="text-xs text-slate-500">{model.stock} · {model.model_type}</p>
                    </div>
                  </div>
                  {model.description && (
                    <p className="mt-3 text-sm text-slate-600 line-clamp-2">{model.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
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
