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

const TABS = [
  ["mi", "Relevance"],
  ["rfe_importance", "RFE"],
  ["best_groups", "Groups"],
  ["feature_label_analysis", "Separability"],
  ["cluster_analysis", "Clusters"],
]

// estos dos van por combinaciones, tardan casi un minuto
const SLOW = ["best_groups", "cluster_analysis"]

export default function AnalysisPanel({
  analysis, loading, error, scope, onScopeChange, onRun, onRunKind, canRun, ranAt,
}) {
  const [showRaw, setShowRaw] = useState(false)
  const [tab, setTab] = useState("mi")
  const [results, setResults] = useState({})
  const [busy, setBusy] = useState(null)

  const mi = analysis?.mi || []
  const target = analysis?.target || {}

  const current = results[tab] || {}
  const isMi = tab === "mi"
  const isLoading = isMi ? loading : busy === tab
  const tabError = isMi ? error : current.error
  const tabRanAt = isMi ? ranAt : current.ranAt
  const hasData = isMi ? !!analysis : current.data !== undefined

  const run = async () => {
    if (isMi) return onRun()
    if (busy) return
    setBusy(tab)
    setResults(p => ({ ...p, [tab]: { ...p[tab], error: null } }))
    try {
      const data = await onRunKind(tab)
      setResults(p => ({ ...p, [tab]: { data, ranAt: new Date().toLocaleTimeString() } }))
    } catch (err) {
      setResults(p => ({ ...p, [tab]: { error: err.message } }))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-slate-100 p-4 text-slate-800">
      <div className="flex rounded-md border border-slate-300 bg-white overflow-hidden text-xs">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 px-2 py-1.5 transition ${
              tab === key ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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
        {tabRanAt && <span className="text-[11px] text-slate-500">last run {tabRanAt}</span>}
        {SLOW.includes(tab) && <span className="text-[11px] text-amber-600">slow, ~1 min</span>}
        <button
          type="button"
          onClick={run}
          disabled={isLoading || !!busy || !canRun}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          {isLoading ? "Analyzing..." : "Analyze features"}
        </button>
      </div>

      {tabError && (
        <div className="rounded-lg bg-red-100 border border-red-300 text-red-700 text-xs p-3">{tabError}</div>
      )}

      {!hasData && !isLoading && !tabError && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-700">No analysis yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Run it to see which features actually carry information about the target.
          </p>
        </div>
      )}

      {isLoading && !hasData && (
        <div className="rounded-xl border border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
          <Loader2 size={18} className="animate-spin mx-auto mb-2" />
          Building the dataset and scoring features...
        </div>
      )}

      {!isMi && hasData && !isLoading && (
        <>
          {tab === "rfe_importance" && <RfeTable csv={current.data} />}
          {tab === "best_groups" && <GroupsList groups={current.data} />}
          {tab === "feature_label_analysis" && <SeparabilityTables sets={current.data} />}
          {tab === "cluster_analysis" && <ClustersTable csv={current.data} />}
        </>
      )}

      {isMi && analysis && mi.length > 0 && (
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

      {isMi && analysis && (
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

function Card({ title, note, children }) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3">
      <h4 className="text-[13px] font-semibold text-slate-800">{title}</h4>
      {note && <p className="text-[11px] text-slate-500 mb-2">{note}</p>}
      {children}
    </div>
  )
}

function Bar({ value, max }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
    </div>
  )
}

function Nothing() {
  return <p className="text-xs text-slate-500">The service returned nothing for this analysis.</p>
}

// las respuestas vienen como csv suelto salvo groups y separability
function rowsOf(payload) {
  const rows = parseCsv(csvOf(payload))
  if (rows.length < 2) return null
  return { head: rows[0].map(h => h.trim()), body: rows.slice(1) }
}

function RfeTable({ csv }) {
  const t = rowsOf(csv)
  if (!t) return <Nothing />

  const iF = t.head.indexOf("Feature")
  const iR = t.head.indexOf("Ranking")
  const iS = t.head.indexOf("Selected")

  return (
    <Card
      title="Recursive feature elimination"
      note="Ranking 1 son las que sobreviven. El resto es el orden en el que se fueron cayendo."
    >
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-500">
              <th className="text-left font-semibold py-1.5 pr-2">Column</th>
              <th className="text-right font-semibold py-1.5 px-2">Ranking ↑</th>
              <th className="text-left font-semibold py-1.5 pl-2">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {t.body.map((r, i) => {
              const kept = Number(r[iS]) === 1
              return (
                <tr key={r[iF] || i} className={`border-t border-slate-200 hover:bg-indigo-50 ${i % 2 ? "bg-slate-50" : ""}`}>
                  <td className={`py-1 pr-2 font-mono ${kept ? "text-slate-800" : "text-slate-500"}`}>{r[iF]}</td>
                  <td className="py-1 px-2 text-right tabular-nums text-slate-600">{r[iR]}</td>
                  <td className="py-1 pl-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      kept ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                    }`}>
                      {kept ? "kept" : "dropped"}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function GroupsList({ groups }) {
  const sizes = Object.keys(groups || {}).sort((a, b) => Number(a) - Number(b))
  if (sizes.length === 0) return <Nothing />

  const all = sizes.flatMap(s => groups[s] || [])
  const max = Math.max(...all.map(g => Number(g.score) || 0), 0)

  return (
    <Card
      title="Best feature groups"
      note="Beam search: para cada tamaño, los grupos con mejor score de cross validation."
    >
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sizes.map(size => (
          <div key={size}>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              {size} feature{size === "1" ? "" : "s"}
            </p>
            <div className="space-y-1">
              {(groups[size] || []).map((g, i) => {
                const names = Array.isArray(g.features) ? g.features : [g.features]
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-slate-700 flex-1 truncate">{names.join(" + ")}</span>
                    <span className="w-24 shrink-0"><Bar value={Number(g.score)} max={max} /></span>
                    <span className="w-14 text-right tabular-nums text-slate-600">{fmt(Number(g.score), 4)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function SeparabilityTables({ sets }) {
  const pairs = Object.keys(sets || {})
  if (pairs.length === 0) return <Nothing />

  return (
    <div className="space-y-3">
      {pairs.map(pair => {
        const t = rowsOf(sets[pair])
        if (!t) return null

        const iF = t.head.indexOf("Feature")
        const iD = t.head.indexOf("Distance")
        const rows = t.body.slice(0, 15)
        const max = Math.max(...rows.map(r => Number(r[iD]) || 0), 0)

        return (
          <Card
            key={pair}
            title={`Classes ${pair}`}
            note="Distancia de Bhattacharyya: cuanto mas alta, menos se solapan las distribuciones de esa feature."
          >
            <div className="space-y-1">
              {rows.map((r, i) => (
                <div key={r[iF] || i} className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-slate-700 flex-1 truncate">{r[iF]}</span>
                  <span className="w-24 shrink-0"><Bar value={Number(r[iD])} max={max} /></span>
                  <span className="w-14 text-right tabular-nums text-slate-600">{fmt(Number(r[iD]), 3)}</span>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// la columna Combination viene como el repr de una lista de python
const cleanCombo = (s) =>
  String(s).replace(/[[\]'"]/g, "").split(",").map(x => x.trim()).filter(Boolean).join(" + ")

function ClustersTable({ csv }) {
  const t = rowsOf(csv)
  if (!t) return <Nothing />

  const iC = t.head.indexOf("Combination")
  const iS = t.head.indexOf("Score")
  const max = Math.max(...t.body.map(r => Number(r[iS]) || 0), 0)

  return (
    <Card
      title="Cluster separation"
      note="Silhouette de cada par de features usando el TARGET como etiqueta. Mas alto = las clases se agrupan mejor."
    >
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {t.body.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="font-mono text-slate-700 flex-1 truncate">{cleanCombo(r[iC])}</span>
            <span className="w-24 shrink-0"><Bar value={Number(r[iS])} max={max} /></span>
            <span className="w-14 text-right tabular-nums text-slate-600">{fmt(Number(r[iS]), 3)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
