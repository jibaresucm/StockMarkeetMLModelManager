import { useParams, Link } from "react-router-dom"

export default function Model() {
  const { id } = useParams()

  // trail data for a model 
  const model = {
    id: id,
    name: `model ${id} for aapl`,
    version: "1.0.1",
    description: `this model predicts the daily movement of apple stock using a combination of technical indicators and sentiment analysis.`,
    project_id: 1, // assuming it belongs to a project
    metrics: { 
      accuracy: 0.75,
      precision: 0.70,
      recall: 0.80,
    },
    created_at: "2024-02-01",
  }

  if (!model) {
    return <div className="text-center text-slate-400">model not found</div> // or a loading state
  }

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
            <p className="font-medium text-slate-300">version:</p>
            <p>{model.version}</p>
          </div>
          <div>
            <p className="font-medium text-slate-300">project:</p>
            <Link to={`/app/projects/${model.project_id}`} className="text-indigo-400 hover:underline">
                project {model.project_id}
            </Link>
          </div>
          <div>
            <p className="font-medium text-slate-300">created at:</p>
            <p>{new Date(model.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </section>
    </div>
  )
}