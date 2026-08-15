import { Sparkles } from "lucide-react"

export default function ProjectReport({ report }) {
  if (!report?.global_analysis) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Sparkles size={18} className="text-indigo-600" />
        Report
      </h2>

      {/* el llm devuelve markdown, quitamos los ** para que no salgan a pelo */}
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {report.global_analysis.replace(/\*\*/g, "")}
      </p>
    </div>
  )
}
