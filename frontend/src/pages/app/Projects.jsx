import ActionButton from "../../components/ActionButton"
import { Link } from "react-router-dom"

export default function Projects() {
  const projects = [
    {
      id: 1,
      name: "aapl daily prediction",
      description: "predict daily movement of apple stock",
      models: 2, 
      created_at: "2024-03-12",
    },
    {
      id: 2,
      name: "sp500 trend analysis",
      description: "market-wide trend prediction model",
      models: 3, 
      created_at: "2024-04-01",
    },
  ]

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

        <ActionButton label="new project" />
      </section>

      {/* projects list section */}
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

/* project card component */

function ProjectCard({ project }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-indigo-900 p-6 hover:border-indigo-700 transition">
      <h2 className="text-lg font-medium text-slate-100">
        {project.name}
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        {project.description}
      </p>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>
          {project.models} models
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
        <ActionButton label="create project" />
      </div>
    </div>
  )
}