export default function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold text-slate-100">
        {value}
      </p>
    </div>
  )
}
