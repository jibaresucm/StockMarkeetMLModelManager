import { TrendingUp, TrendingDown, Info, Sparkles } from "lucide-react"

const pct = (v) => (typeof v === "number" ? `${(v * 100).toFixed(1)}%` : "—")

export default function ProjectReport({ report }) {
  const models = report.models || []
  const ups = models.filter(m => m.prediction === "SUBE").length
  const downs = models.length - ups

  return (
    <div className="space-y-6">

      {/* resumen */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Report</h2>
            <p className="mt-1 text-sm text-slate-600">
              {models.length} model{models.length === 1 ? "" : "s"} predicted
              {models[0]?.date ? ` for ${models[0].date}` : ""}
            </p>
          </div>

          <div className="flex gap-3">
            <Consensus label="UP" count={ups} total={models.length} up />
            <Consensus label="DOWN" count={downs} total={models.length} />
          </div>
        </div>
      </div>

      {/* un bloque por modelo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models.map(model => (
          <ModelReportCard key={model.id} model={model} />
        ))}
      </div>

      {/* explicaciones de target y sampling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Explanations title="Targets" items={report.target_descriptions} />
        <Explanations title="Sampling methods" items={report.sampling_descriptions} />
      </div>

      {/* analisis del llm */}
      {report.global_analysis && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-6">
          <h3 className="flex items-center gap-2 font-semibold text-indigo-900">
            <Sparkles size={18} className="text-indigo-600" />
            Global analysis
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {report.global_analysis}
          </p>
        </div>
      )}

    </div>
  )
}

function Consensus({ label, count, total, up }) {
  const share = total ? Math.round((count / total) * 100) : 0

  return (
    <div className={`rounded-lg border px-4 py-2 text-center ${
      up ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
    }`}>
      <p className={`text-xl font-bold ${up ? "text-emerald-700" : "text-red-700"}`}>
        {count}
      </p>
      <p className="text-xs text-slate-500">{label} · {share}%</p>
    </div>
  )
}

function ModelReportCard({ model }) {
  const up = model.prediction === "SUBE"

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">{model.ticker}</p>
          <p className="text-sm text-slate-500">{model.model}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <Tag>{model.target}</Tag>
            <Tag>{model.sampling}</Tag>
          </div>
        </div>

        <div className={`rounded-lg border px-4 py-3 text-right ${
          up ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
        }`}>
          <p className={`flex items-center gap-2 font-semibold ${up ? "text-emerald-700" : "text-red-700"}`}>
            {up ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {up ? "UP" : "DOWN"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {model.confidence}% confidence
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Accuracy" value={pct(model.accuracy)} />
        <Metric label="Prec. up" value={pct(model.precision_up)} />
        <Metric label="Prec. down" value={pct(model.precision_down)} />
        <Metric label="Recall up" value={pct(model.recall_up)} />
        <Metric label="Recall down" value={pct(model.recall_down)} />
      </div>

      <ConfusionMatrix matrix={model.confusion_matrix} />

    </div>
  )
}

export function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export function ConfusionMatrix({ matrix }) {
  if (!Array.isArray(matrix) || matrix.length < 2) return null

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Confusion matrix</p>
      <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-slate-50 text-xs text-slate-500">
            <th className="p-2 font-medium text-left"></th>
            <th className="p-2 font-medium">pred. down</th>
            <th className="p-2 font-medium">pred. up</th>
          </tr>
        </thead>
        <tbody>
          {["real down", "real up"].map((label, i) => (
            <tr key={label} className="border-t border-slate-200">
              <td className="p-2 text-xs text-slate-500">{label}</td>
              {matrix[i].map((cell, j) => (
                <td
                  key={j}
                  className={`p-2 text-center font-medium ${
                    i === j ? "bg-emerald-50 text-emerald-700" : "text-slate-700"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Explanations({ title, items }) {
  const entries = Object.entries(items || {})
  if (entries.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
        <Info size={16} className="text-indigo-600" />
        {title}
      </h3>

      <dl className="mt-3 space-y-3">
        {entries.map(([name, text]) => (
          <div key={name}>
            <dt className="text-sm font-medium text-slate-700">{name}</dt>
            <dd className="text-sm text-slate-600">{text}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Tag({ children }) {
  return (
    <span className="px-2 py-0.5 text-xs rounded-full border border-slate-200 bg-slate-50 text-slate-600">
      {children}
    </span>
  )
}
