import { useState } from "react"
import { Loader2, Search, ChevronDown, ChevronRight } from "lucide-react"

function parseCsv(text) {
  if (!text || typeof text !== "string") return []
  const rows = []
  let row = [], cell = "", quoted = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++ }
        else quoted = false
      } else cell += c
    }
    else if (c === '"') quoted = true
    else if (c === ",") { row.push(cell); cell = "" }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = "" }
    else if (c !== "\r") cell += c
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row) }

  return rows.filter(r => r.some(v => v !== ""))
}

function csvOf(payload) {
  if (typeof payload === "string") return payload
  if (payload && typeof payload.data === "string") return payload.data
  return null
}

export function parseAnalysis(raw) {
  const miRows = parseCsv(csvOf(raw?.mutual_info))
  const corrRows = parseCsv(csvOf(raw?.correlations))

  const mi = []
  if (miRows.length > 1) {
    const head = miRows[0].map(h => h.trim())
    const iF = head.indexOf("Feature")
    const iNet = head.indexOf("Net_MI")
    const iReal = head.indexOf("Real MI")
    const iConf = head.indexOf("Confidence")
    for (const r of miRows.slice(1)) {
      if (iF < 0 || !r[iF]) continue
      mi.push({
        column: r[iF].trim(),
        net: Number(r[iNet]),
        real: Number(r[iReal]),
        conf: Number(r[iConf]) === 1,
      })
    }
    mi.sort((a, b) => b.net - a.net)
  }

  const target = {}
  if (corrRows.length > 1) {
    const head = corrRows[0].slice(1).map(h => h.trim())
    const row = corrRows.slice(1).find(r => r[0].trim() === "TARGET")
    if (row) head.forEach((h, i) => {
      const v = Number(row[i + 1])
      target[h] = Number.isNaN(v) ? null : v
    })
  }

  return { mi, target }
}

const fmt = (v, n = 3) => (v === null || v === undefined || Number.isNaN(v) ? "—" : v.toFixed(n))

export default function AnalysisPanel({
  analysis, loading, error, scope, onScopeChange, onRun, canRun, ranAt,
}) {
  const [showRaw, setShowRaw] = useState(false)
  const mi = analysis?.mi || []
  const target = analysis?.target || {}

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-slate-100 p-4 text-slate-800">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-md border border-slate-300 bg-white overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => onScopeChange(false)}
            className={`px-3 py-1.5 transition ${!scope ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            Selected
          </button>
          <button
            type="button"
            onClick={() => onScopeChange(true)}
            className={`px-3 py-1.5 transition ${scope ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            Full dataset
          </button>
        </div>
        {ranAt && <span className="text-[11px] text-slate-500">last run {ranAt}</span>}
        <button
          type="button"
          onClick={onRun}
          disabled={loading || !canRun}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          {loading ? "Analyzing..." : "Analyze features"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-100 border border-red-300 text-red-700 text-xs p-3">{error}</div>
      )}

      {!analysis && !loading && !error && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-700">No analysis yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Run it to see which features actually carry information about the target.
          </p>
        </div>
      )}

      {loading && !analysis && (
        <div className="rounded-xl border border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
          <Loader2 size={18} className="animate-spin mx-auto mb-2" />
          Building the dataset and scoring features...
        </div>
      )}

      {analysis && mi.length > 0 && (
        <div className="rounded-xl border border-slate-300 bg-white p-3">
          <h4 className="text-[13px] font-semibold text-slate-800">Relevance to TARGET</h4>
          <p className="text-[11px] text-slate-500 mb-2">
            Net MI = real mutual information minus the mean of 50 block permutations.
            Negative means the feature does no better than chance.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="text-left font-semibold py-1.5 pr-2">#</th>
                  <th className="text-left font-semibold py-1.5 pr-2">Column</th>
                  <th className="text-right font-semibold py-1.5 px-2">Net MI ↓</th>
                  <th className="text-right font-semibold py-1.5 px-2">Real MI</th>
                  <th className="text-right font-semibold py-1.5 px-2">Corr</th>
                  <th className="text-left font-semibold py-1.5 pl-2">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {mi.map((m, i) => (
                  <tr key={m.column} className={`border-t border-slate-200 hover:bg-indigo-50 ${i % 2 ? "bg-slate-50" : ""}`}>
                    <td className="py-1 pr-2 text-right text-slate-400 tabular-nums">{i + 1}</td>
                    <td className={`py-1 pr-2 font-mono ${m.conf ? "text-slate-800" : "text-slate-500"}`}>{m.column}</td>
                    <td className={`py-1 px-2 text-right tabular-nums ${m.net > 0 ? "text-emerald-600 font-medium" : "text-slate-500"}`}>{fmt(m.net, 4)}</td>
                    <td className="py-1 px-2 text-right tabular-nums text-slate-600">{fmt(m.real, 4)}</td>
                    <td className="py-1 px-2 text-right tabular-nums text-slate-600">{fmt(target[m.column], 2)}</td>
                    <td className="py-1 pl-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        m.conf ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                      }`}>
                        {m.conf ? "signal" : "noise"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {analysis && (
        <div className="rounded-xl border border-slate-300 bg-slate-50">
          <button
            type="button"
            onClick={() => setShowRaw(v => !v)}
            className="flex items-center gap-1.5 w-full px-3 py-2 text-[11px] text-slate-500 hover:text-slate-700 transition"
          >
            {showRaw ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Raw CSV from the service
          </button>
          {showRaw && (
            <pre className="px-3 pb-3 text-[10px] text-slate-500 overflow-x-auto max-h-48">{analysis.rawText}</pre>
          )}
        </div>
      )}
    </div>
  )
}
