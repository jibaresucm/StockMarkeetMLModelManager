import { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import ActionButton from "../../components/ActionButton"

export default function Models() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/models');
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        setModels(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

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

        <ActionButton label="New model" />
      </section>

      {/* models list section */}
      {loading && <p className="text-slate-400">Loading models...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && (
        models.length === 0 ? (
          <EmptyState />
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {models.map(model => (
              <ModelCard key={model.id} model={model} />
            ))}
          </section>
        )
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
        <ActionButton label="Create model" />
      </div>
    </div>
  )
}