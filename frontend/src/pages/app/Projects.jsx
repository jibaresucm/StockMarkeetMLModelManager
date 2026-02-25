import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { projectsApi } from "../../api.js"

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
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

  if (loading) return <div className="text-slate-400">Loading projects...</div>
  if (error) return <div className="text-red-400">Error: {error}</div>

  return (
    <div className="space-y-8">

      {/* header section */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Projects
          </h1>
          <p className="mt-2 text-slate-400">
            Manage your projects and access their machine learning models.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
        >
          New Project
        </button>
      </section>

      {/* create form */}
      {showForm && (
        <section className="rounded-lg border border-indigo-700 bg-indigo-900 p-6 space-y-4">
          <h2 className="text-lg font-medium text-slate-100">Create New Project</h2>
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

      {/* projects list section */}
      {projects.length === 0 ? (
        <EmptyState onNew={() => setShowForm(true)} />
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
          ))}
        </section>
      )}

    </div>
  )
}

function ProjectCard({ project, onDelete }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-indigo-900 p-6 hover:border-indigo-700 transition">
  <div className="flex items-start justify-between gap-4">
    <Link to={`/app/projects/${project.id}`} className="flex-1 min-w-0">
      <h2 className="text-lg font-medium text-slate-100 truncate">
        {project.name}
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        {project.description}
      </p>
     <div className="mt-4 text-sm text-slate-400">
          Created {new Date(project.created_at).toLocaleDateString()}
          </div>
        </Link>
        <button
          onClick={() => onDelete(project.id)}
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
    <div className="rounded-lg border border-dashed border-slate-800 p-10 text-center">
      <h2 className="text-lg font-medium text-slate-100">
        No projects yet
      </h2>

      <p className="mt-2 text-slate-400">
        Create your first project to start building prediction models.
      </p>

      <div className="mt-6 flex justify-center">
        <button
          onClick={onNew}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
        >
          Create project
        </button>
      </div>
    </div>
  )
}