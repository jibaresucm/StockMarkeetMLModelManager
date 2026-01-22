import ActionButton from "../../components/ActionButton"

export default function Projects() {
  // 🔴 Datos simulados (vendrán del backend)
  const projects = [
    {
      id: 1,
      name: "AAPL Daily Prediction",
      description: "Predict daily movement of Apple stock",
      models: 2,
      createdAt: "2024-03-12",
    },
    {
      id: 2,
      name: "SP500 Trend Analysis",
      description: "Market-wide trend prediction model",
      models: 3,
      createdAt: "2024-04-01",
    },
  ]

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
            <ProjectCard key={project.id} project={project} />
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
          {project.models} models
        </span>

        <span>
          Created {project.createdAt}
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
