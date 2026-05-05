import { X } from "lucide-react"

export default function FeatureAnalysisModal({ data, onClose }) {
  if (!data) return null

  if (data.error) {
    return (
      <div className="fixed inset-0 z-60 bg-slate-950/20 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#1e1b2e] rounded-xl shadow-2xl w-full max-w-md max-h-[50vh] flex flex-col border border-indigo-800">
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <h2 className="text-lg font-semibold text-slate-100">Analysis Error</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition">
              <X size={20} />
            </button>
          </div>
          <div className="px-6 py-4">
            <p className="text-red-300">{data.error}</p>
          </div>
          <div className="flex justify-end px-6 py-4 border-t border-indigo-800">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Extract inner data if wrapped in {data: ...}
  const innerData = data.data || data
  
  const getCsvString = (payload) => {
    if (!payload) return null
    if (typeof payload === 'string') return payload
    if (typeof payload.data === 'string') return payload.data
    return null
  }

  const parseCsvTable = (csvString) => {
    if (!csvString || typeof csvString !== 'string') return []
    const lines = csvString.split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) return []
    const headers = lines[0].split(",").map(h => h.trim())
    return lines.slice(1).map(line => {
      const cols = line.split(",")
      return headers.reduce((row, header, index) => {
        row[header] = cols[index]?.trim() ?? ''
        return row
      }, {})
    }).filter(row => Object.values(row).some(Boolean))
  }

  const parseCorrelationCsv = (csvString) => {
    const rows = parseCsvTable(csvString)
    if (rows.length === 0) return {}

    const headers = Object.keys(rows[0])
    if (headers.length < 2) return {}

    const featureKey = headers[0]
    const featureNames = rows.map(row => row[featureKey]).filter(Boolean)
    const correlations = {}

    rows.forEach(row => {
      const featureA = row[featureKey]
      if (!featureA) return
      correlations[featureA] = {}
      headers.slice(1).forEach(col => {
        const rawValue = row[col]
        const value = rawValue === '' ? null : Number(rawValue)
        correlations[featureA][col] = Number.isNaN(value) ? null : value
      })
    })

    return correlations
  }

  const parseMutualInfoCsv = (csvString) => {
    const rows = parseCsvTable(csvString)
    const info = {}
    rows.forEach(row => {
      const feature = row['Feature'] || row['feature'] || row['Feature ']
      if (!feature) return
      const value = row['Net_MI'] ?? row['Real MI'] ?? row['MI'] ?? row['mi']
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        info[feature] = parsed
      }
    })
    return info
  }

  const correlations = typeof innerData.correlations === 'string'
    ? parseCorrelationCsv(innerData.correlations)
    : innerData.correlations || {}

  const mutualInfo = typeof innerData.mutual_info === 'string'
    ? parseMutualInfoCsv(innerData.mutual_info)
    : innerData.mutual_info || {}

  const parsedCsvRows = parseCsvTable(getCsvString(innerData))

  const parseCsvFeatures = (csvString) => {
    const rows = parseCsvTable(csvString)
    if (rows.length === 0) return []
    if (rows[0].Feature) {
      return rows.map(row => row.Feature).filter(Boolean)
    }
    const firstKey = Object.keys(rows[0])[0]
    return rows.map(row => row[firstKey]).filter(Boolean)
  }

  const rawFeatures = innerData.features || Object.keys(correlations) || parseCsvFeatures(getCsvString(innerData))
  const features = Array.isArray(rawFeatures)
    ? rawFeatures
    : rawFeatures && typeof rawFeatures === 'object'
      ? Object.keys(rawFeatures).filter(key => {
          const value = rawFeatures[key]
          return value !== undefined && value !== false && value !== null
        })
      : []

  const derivedMutualInfoEntries = Object.keys(mutualInfo).length > 0
    ? Object.entries(mutualInfo)
    : parsedCsvRows.map(row => {
      const value = row['Real MI'] ?? row['Net_MI'] ?? row['MI'] ?? ''
      const parsedValue = parseFloat(value)
      return [row['Feature'], Number.isNaN(parsedValue) ? null : parsedValue]
    }).filter(([, value]) => value !== null)

  const formatNumber = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "—"
    return typeof value === 'number' ? value.toFixed(3) : value
  }

  const getPairs = () => {
    const keys = Object.keys(correlations)
    const pairs = []
    for (let i = 0; i < keys.length; i += 1) {
      const featureA = keys[i]
      const row = correlations[featureA] || {}
      for (let j = i + 1; j < keys.length; j += 1) {
        const featureB = keys[j]
        const value = row[featureB] ?? row[featureA] ?? null
        if (value !== null && value !== undefined) {
          pairs.push({ featureA, featureB, value })
        }
      }
    }
    return pairs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  }

  const topPairs = getPairs().slice(0, 6)

  const correlationKeys = Object.keys(correlations)
  const mutualInfoEntries = derivedMutualInfoEntries

  const cellClass = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value)
    if (Number.isNaN(num)) return "bg-slate-900 text-slate-300"
    const intensity = Math.min(1, Math.abs(num))
    if (num > 0.5) return "bg-emerald-600/30 text-emerald-200"
    if (num > 0.2) return "bg-emerald-500/20 text-emerald-200"
    if (num < -0.5) return "bg-rose-600/30 text-rose-200"
    if (num < -0.2) return "bg-rose-500/20 text-rose-200"
    return "bg-slate-900 text-slate-300"
  }

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/15 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e1b2e] rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-indigo-800">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Feature Analysis</h2>
            <p className="text-sm text-slate-400">Summary of feature structure, correlations, and relevance.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-indigo-700 bg-indigo-900/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Selected Features</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{features.length}</p>
              <p className="mt-1 text-sm text-slate-400">Features found in the analysis result.</p>
            </div>
            <div className="rounded-xl border border-indigo-700 bg-indigo-900/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Correlation Matrix</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{correlationKeys.length > 0 ? correlationKeys.length : 'N/A'}</p>
              <p className="mt-1 text-sm text-slate-400">Count of correlation variables in the response.</p>
            </div>
            <div className="rounded-xl border border-indigo-700 bg-indigo-900/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Mutual Info</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{mutualInfoEntries.length}</p>
              <p className="mt-1 text-sm text-slate-400">Features with a mutual information score.</p>
            </div>
          </div>

          {features.length > 0 && (
            <div className="rounded-2xl border border-indigo-700 bg-indigo-900/30 p-4">
              <h3 className="text-md font-semibold text-slate-200 mb-3">Selected Features</h3>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, idx) => (
                  <span key={idx} className="rounded-full border border-indigo-600 bg-indigo-900/60 px-3 py-1 text-xs font-medium text-slate-200">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {topPairs.length > 0 && (
            <div className="rounded-2xl border border-indigo-700 bg-indigo-900/30 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-slate-200">Top Correlations</h3>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Absolute strength</span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {topPairs.map((pair, idx) => (
                  <div key={idx} className="rounded-xl border border-indigo-700 bg-indigo-950/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-slate-100 font-medium">{pair.featureA} ↔ {pair.featureB}</p>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${pair.value > 0 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>
                        {formatNumber(pair.value)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{Math.abs(pair.value) >= 0.5 ? 'High correlation' : Math.abs(pair.value) >= 0.2 ? 'Moderate correlation' : 'Low correlation'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {correlationKeys.length > 0 ? (
            <div className="rounded-2xl border border-indigo-700 bg-indigo-900/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-md font-semibold text-slate-200">Correlation Matrix</h3>
                  <p className="text-sm text-slate-400">Values near 1 or -1 indicate strong relationships.</p>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-indigo-800 bg-slate-950/60">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 border border-indigo-700 bg-indigo-900/80 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">Feature</th>
                      {correlationKeys.map((feature, idx) => (
                        <th key={idx} className="border border-indigo-700 bg-indigo-900/80 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
                          {feature}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlationKeys.map((feature, rowIndex) => (
                      <tr key={feature} className={rowIndex % 2 === 0 ? 'bg-indigo-950/20' : 'bg-slate-950/10'}>
                        <td className="sticky left-0 z-10 border border-indigo-700 bg-indigo-950/80 px-3 py-2 text-sm font-medium text-slate-200">
                          {feature}
                        </td>
                        {correlationKeys.map((colFeature, colIndex) => {
                          const value = correlations[feature]?.[colFeature]
                          return (
                            <td key={`${rowIndex}-${colIndex}`} className={`border border-indigo-700 px-3 py-2 text-center text-sm ${cellClass(value)}`}>
                              {formatNumber(value)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-indigo-700 bg-indigo-900/20 p-4 text-slate-300">
              <h3 className="text-md font-semibold text-slate-200 mb-2">Correlation Matrix</h3>
              <p className="text-sm text-slate-400">No correlation matrix was returned for this analysis.</p>
            </div>
          )}

          {mutualInfoEntries.length > 0 && (
            <div className="rounded-2xl border border-indigo-700 bg-indigo-900/30 p-4">
              <h3 className="text-md font-semibold text-slate-200 mb-3">Mutual Information</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {mutualInfoEntries.map(([feature, mi], idx) => (
                  <div key={idx} className="rounded-xl border border-indigo-700 bg-indigo-950/40 p-3">
                    <p className="text-sm text-slate-200 font-medium">{feature}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-100">{formatNumber(mi)}</p>
                    <p className="mt-1 text-xs text-slate-400">Higher values indicate stronger relevance to the target.</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-indigo-700 bg-indigo-900/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-slate-200">Raw Analysis Data</h3>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Debug</span>
            </div>
            <pre className="text-xs text-slate-400 bg-indigo-950 p-3 rounded border border-indigo-700 overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-indigo-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}