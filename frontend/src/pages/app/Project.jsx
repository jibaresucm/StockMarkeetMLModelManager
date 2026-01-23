import { useParams, Link } from "react-router-dom"

export default function Project() {
  const { id } = useParams()
  const project = {
    id: id,
    name: `project ${id} name`,
    description: `this is a detailed description for project ${id}. it involves advanced machine learning models for stock market prediction.`,
    created_at: "2024-01-15",
  }

  const models = [
    { id: 101, name: "model a v1.0", description: "predicts daily movement of apple stock" },
    { id: 102, name: "model b v2.1", description: "market-wide trend prediction model" },
  ]

  if (!project) {
    return <div className="text-center text-slate-400">project not found</div> // or a loading state
  }

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
            <p>{new Date(project.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </section>

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