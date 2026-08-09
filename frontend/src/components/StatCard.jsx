import { Link } from "react-router-dom"

export default function StatCard({ label, value, hint, icon: Icon, to }) {
  const card = (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
            <Icon size={20} className="text-indigo-600" />
          </div>
        )}
      </div>

      {hint && <p className="mt-3 text-xs text-slate-400">{hint}</p>}
    </div>
  )

  return to ? <Link to={to} className="block h-full">{card}</Link> : card
}
