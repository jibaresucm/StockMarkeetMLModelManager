import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { FolderKanban, Plus, Trash2 } from "lucide-react"
import Button from "../../components/Button.jsx"
import { projectsApi } from "../../api.js"

export default function Projects() {
  const location = useLocation()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(!!location.state?.new)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [formError, setFormError] = useState(null)

  const loadProjects = () => {
    setLoading(true)
    projectsApi.readAll()
      .then(list => { setProjects(list); setError(null) })
      .catch(err => {
        // Service throws this when the user simply has no projects yet
        if (err.message && err.message.includes("does not have any projects")) {
          setProjects([])
        } else {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProjects() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(null)
    try {
      await projectsApi.create(formData)
      setShowForm(false)
      setFormData({ name: "", description: "" })
      loadProjects()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await projectsApi.delete(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="text-slate-500">Loading projects...</div>
  if (error) return <div className="text-red-600">Error: {error}</div>

  return (
    <div className="space-y-8">

      {/* header section */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Projects
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your projects and access their machine learning models.
          </p>
        </div>

        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus size={16} />
          New Project
        </Button>
      </section>

      {/* create form */}
      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Create New Project</h2>
          {formError && <p className="text-red-600 text-sm">{formError}</p>}
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input
              placeholder="Name *"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              className="border border-slate-300 px-3 py-2 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              placeholder="Description"
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className="border border-slate-300 px-3 py-2 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3">
              <Button type="submit" size="sm">Create</Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setShowForm(false); setFormError(null) }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* projects list section */}
      {projects.length === 0 ? (
        <EmptyState onNew={() => setShowForm(true)} />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

          <div className="grid grid-cols-[1fr_1.5fr_7rem_5rem] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>Name</span>
            <span>Description</span>
            <span>Created</span>
            <span className="text-right">Actions</span>
          </div>

          {projects.map(project => (
            <ProjectListItem key={project.id} project={project} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectListItem({ project, onDelete }) {
  return (
    <div className="grid grid-cols-[1fr_1.5fr_7rem_5rem] gap-4 items-center px-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
      <Link to={`/app/projects/${project.id}`} className="font-medium text-slate-900 truncate hover:text-indigo-600 transition">
        {project.name}
      </Link>

      <span className="text-sm text-slate-600 truncate">
        {project.description}
      </span>

      <span className="text-xs text-slate-500 whitespace-nowrap">
        {new Date(project.created_at).toLocaleDateString()}
      </span>

      <span className="text-right">
        <button
          onClick={() => onDelete(project.id)}
          title="Delete project"
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
        <FolderKanban size={26} className="text-indigo-600" />
      </div>

      <h2 className="text-lg font-semibold text-slate-900">
        No projects yet
      </h2>

      <p className="mt-2 text-slate-600">
        Create your first project to start building prediction models.
      </p>

      <div className="mt-6 flex justify-center">
        <Button onClick={onNew} size="sm">Create project</Button>
      </div>
    </div>
  )
}