import ActionButton from "../../components/ActionButton"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return <div className="text-center text-slate-400">Loading projects...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error.message}</div>
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Projects
          </h1>
          <p className="mt-2 text-slate-400">
            Manage your projects and access their machine learning models.
          </p>
        </div>

        <ActionButton label="New project" />
      </section>

      {/* Projects list */}
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(project => (
            <Link to={`/app/projects/${project.id}`} key={project.id}>
              <ProjectCard project={project} />
            </Link>
          ))}
        </section>
      )}

    </div>
  )
}

/* ---------- Components ---------- */

function ProjectCard({ project }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 hover:border-slate-700 transition">
      <h2 className="text-lg font-medium text-slate-100">
        {project.name}
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        {project.description}
      </p>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>
          {project.models} models {/* This will need to be fetched dynamically later */}
        </span>

        <span>
          Created {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-800 p-10 text-center">
      <h2 className="text-lg font-medium text-slate-100">
        No projects yet
      </h2>

      <p className="mt-2 text-slate-400">
        Create your first project to start building prediction models.
      </p>

      <div className="mt-6 flex justify-center">
        <ActionButton label="Create project" />
      </div>
    </div>
  )
}
