import StatCard from "../../components/StatCard"
import ActionButton from "../../components/ActionButton"

export default function Dashboard() {
  // 🔴 Datos simulados (luego vendrán del backend)
  const user = {
    name: "Carlos",
    projects: 3,
    models: 5,
    predictionsToday: 2,
  }

  return (
    <div className="space-y-10">

      {/* Welcome */}
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back,{" "}
          <span className="text-indigo-500">{user.name}</span>
        </h1>

        <p className="text-slate-400 mt-2">
          Here’s an overview of your projects and machine learning models.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Projects"
          value={user.projects}
        />
        <StatCard
          label="Models"
          value={user.models}
        />
        <StatCard
          label="Predictions today"
          value={user.predictionsToday}
        />
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-medium mb-4">
          Quick actions
        </h2>

        <div className="flex flex-wrap gap-4">
          <ActionButton label="New Project" />
          <ActionButton label="New Model" secondary />
          <ActionButton label="Run Prediction" />
        </div>
      </section>

      {/* Activity */}
      <section>
        <h2 className="text-lg font-medium mb-4">
          Recent activity
        </h2>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-slate-400">
          No recent activity yet.
        </div>
      </section>

    </div>
  )
}
