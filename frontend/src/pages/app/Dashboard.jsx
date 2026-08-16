import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FolderKanban, BrainCircuit, CandlestickChart, Plus, Zap } from "lucide-react"
import StatCard from "../../components/StatCard"
import ActionButton from "../../components/ActionButton"
import { modelsApi, projectsApi } from "../../api.js"

export default function Dashboard({ user }) {
  const navigate = useNavigate()
  const [models, setModels] = useState([])
  const [projects, setProjects] = useState([])

  useEffect(() => {
    modelsApi.readAll()
      .then(list => setModels(Array.isArray(list) ? list : []))
      .catch(() => setModels([]))

    projectsApi.readAll()
      .then(list => setProjects(Array.isArray(list) ? list : []))
      .catch(() => setProjects([]))
  }, [])

  const activity = [
    ...models.map(m => ({ id: `m${m.id}`, kind: "model", name: m.name, date: m.createdAt, to: `/app/models/${m.id}` })),
    ...projects.map(p => ({ id: `p${p.id}`, kind: "project", name: p.name, date: p.created_at, to: `/app/projects/${p.id}` })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const tickers = new Set(models.map(m => m.stock).filter(Boolean))

  return (
    <div className="space-y-10">

      {/* Welcome */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome back,{" "}
          <span className="text-indigo-600">{user?.username ?? ""}</span>
        </h1>

        <p className="text-slate-600 mt-2">
          Here's an overview of your projects and machine learning models.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Projects"
          value={projects.length}
          icon={FolderKanban}
          to="/app/projects"
        />
        <StatCard
          label="Models"
          value={models.length}
          icon={BrainCircuit}
          to="/app/models"
        />
        <StatCard
          label="Tickers tracked"
          value={tickers.size}
          hint={[...tickers].slice(0, 6).join(" · ")}
          icon={CandlestickChart}
        />
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Quick actions
        </h2>

        <div className="flex flex-wrap gap-4">
          <ActionButton label="New Project" icon={Plus} onClick={() => navigate("/app/projects", { state: { new: true } })} />
          <ActionButton label="New Model" icon={Plus} secondary onClick={() => navigate("/app/models", { state: { new: true } })} />
          <ActionButton label="Run Prediction" icon={Zap} secondary onClick={() => navigate("/app/models")} />
        </div>
      </section>

      {/* Activity */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Recent activity
        </h2>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {activity.length === 0 ? (
            <p className="p-6 text-slate-500">
              No recent activity yet.
            </p>
          ) : (
            activity.map(item => (
              <Link
                key={item.id}
                to={item.to}
                className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 shrink-0">
                  {item.kind === "model"
                    ? <BrainCircuit size={16} className="text-indigo-600" />
                    : <FolderKanban size={16} className="text-indigo-600" />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-slate-900 truncate">{item.name}</span>
                  <span className="block text-xs text-slate-500 capitalize">{item.kind} created</span>
                </span>

                <span className="text-xs text-slate-400 shrink-0">
                  {item.date ? new Date(item.date).toLocaleDateString() : ""}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

    </div>
  )
}

