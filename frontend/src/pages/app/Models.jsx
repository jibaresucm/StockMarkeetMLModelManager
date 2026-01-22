import { Link } from "react-router-dom"
import ActionButton from "../../components/ActionButton"

export default function Models() {
  const models = [
    {
      id: 101,
      name: "aapl daily prediction v1.0",
      description: "predict daily movement of apple stock using lstm.",
      project_id: 1, // project id this model belongs to
      created_at: "2024-03-15",
    },
    {
      id: 102,
      name: "sp500 trend v2.1",
      description: "analyze market trend of s&p 500 using moving averages.",
      project_id: 2,
      created_at: "2024-04-05",
    },
    {
      id: 103,
      name: "nvda price forecast v1.0",
      description: "forecast nvidia stock price using arima model.",
      project_id: 1,
      created_at: "2024-04-10",
    },
  ]

  return (
    <div className="space-y-8">

      {/* header section */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Models
          </h1>
          <p className="mt-2 text-slate-400">
            Manage your machine learning models and track their performance.
          </p>
        </div>

        <ActionButton label="new model" />
      </section>

      {/* models list section */}
      {models.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map(model => (
            <ModelCard key={model.id} model={model} />
          ))}
        </section>
      )}

    </div>
  )
}

/* model card component */

function ModelCard({ model }) {
  return (
    <Link to={`/app/models/${model.id}`} className="block">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 hover:border-slate-700 transition">
        <h2 className="text-lg font-medium text-slate-100">
          {model.name}
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          {model.description}
        </p>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>
            Project ID: {model.project_id}
          </span>

          <span>
            Created {new Date(model.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-800 p-10 text-center">
      <h2 className="text-lg font-medium text-slate-100">
        No models yet
      </h2>

      <p className="mt-2 text-slate-400">
        Create your first model to start making predictions.
      </p>

      <div className="mt-6 flex justify-center">
        <ActionButton label="create model" />
      </div>
    </div>
  )
}