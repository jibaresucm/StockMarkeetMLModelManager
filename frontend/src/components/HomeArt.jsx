const PRICE = [
  [24, 224], [44, 231], [64, 218], [84, 222], [104, 206], [124, 212],
  [144, 198], [164, 204], [184, 186], [204, 192], [224, 178], [244, 188],
  [264, 170], [284, 176], [304, 158], [324, 166], [344, 150], [364, 158],
  [384, 142], [404, 148], [424, 132], [444, 138], [464, 124], [484, 116],
]

const line = PRICE.map(p => p.join(",")).join(" ")
const area = `${line} 484,250 24,250`

export function PredictionMockup() {
  return (
    <svg viewBox="0 0 520 380" className="w-full h-auto drop-shadow-2xl" role="img"
      aria-label="Prediction panel showing AAPL trending up with 68% confidence">
      <defs>
        <linearGradient id="pmArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="520" height="380" rx="16" fill="#131a2b" stroke="#334155" />
      <path d="M0 44 H520" stroke="#334155" />
      <circle cx="24" cy="22" r="4" fill="#475569" />
      <circle cx="40" cy="22" r="4" fill="#475569" />
      <circle cx="56" cy="22" r="4" fill="#475569" />
      <text x="80" y="27" fill="#94a3b8" fontSize="12" fontFamily="ui-monospace, monospace">
        AAPL · daily · 500d
      </text>

      <text x="24" y="76" fill="#64748b" fontSize="11" letterSpacing="1.2">LAST CLOSE</text>
      <text x="24" y="104" fill="#f1f5f9" fontSize="28" fontWeight="600">232.41</text>
      <text x="132" y="104" fill="#34d399" fontSize="14" fontWeight="500">+1.24%</text>

      {[130, 170, 210, 250].map(y => (
        <path key={y} d={`M24 ${y} H496`} stroke="#1e293b" strokeDasharray="3 5" />
      ))}

      <polygon points={area} fill="url(#pmArea)" />
      <polyline points={line} fill="none" stroke="#818cf8" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="484" cy="116" r="9" fill="#818cf8" opacity="0.25" />
      <circle cx="484" cy="116" r="4" fill="#a5b4fc" />

      <rect x="24" y="278" width="212" height="66" rx="10" fill="#34d399" fillOpacity="0.1"
        stroke="#34d399" strokeOpacity="0.4" />
      <path d="M46 316 L56 302 L66 316 Z" fill="#34d399" />
      <text x="78" y="306" fill="#34d399" fontSize="17" fontWeight="600">UP</text>
      <text x="78" y="326" fill="#94a3b8" fontSize="11">68% confidence</text>

      {[["ACC", "0.61", 260], ["PREC", "0.64", 340], ["REC", "0.58", 420]].map(([k, v, x]) => (
        <g key={k}>
          <rect x={x} y="278" width="72" height="66" rx="10" fill="#0f172a" stroke="#1e293b" />
          <text x={x + 36} y="304" fill="#64748b" fontSize="10" textAnchor="middle" letterSpacing="0.8">{k}</text>
          <text x={x + 36} y="326" fill="#e2e8f0" fontSize="16" textAnchor="middle" fontWeight="500">{v}</text>
        </g>
      ))}
    </svg>
  )
}

export function TickerArt() {
  return (
    <svg viewBox="0 0 200 110" className="w-full h-auto max-w-[200px] mx-auto" aria-hidden="true">
      <rect x="10" y="16" width="180" height="34" rx="8" fill="#fff" stroke="#cbd5e1" />
      <circle cx="30" cy="33" r="6" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <path d="M34.5 37.5 L39 42" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <text x="46" y="38" fill="#334155" fontSize="13" fontFamily="ui-monospace, monospace">AAPL</text>
      <rect x="10" y="58" width="180" height="36" rx="8" fill="#eef2ff" stroke="#c7d2fe" />
      <text x="24" y="74" fill="#4338ca" fontSize="12" fontWeight="600">AAPL</text>
      <text x="24" y="88" fill="#6366f1" fontSize="10">Apple Inc. · NASDAQ</text>
      <path d="M170 74 l5 5 l9 -11" stroke="#4f46e5" strokeWidth="2.5" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FeaturesArt() {
  const bars = [
    ["HURST_20", 112], ["YANG_ZHANG_20", 95], ["ADX_10", 77],
    ["RVOL_40", 56], ["DIST_SMA_80", 38],
  ]
  return (
    <svg viewBox="0 0 200 110" className="w-full h-auto max-w-[200px] mx-auto" aria-hidden="true">
      {bars.map(([name, w], i) => (
        <g key={name}>
          <text x="74" y={21 + i * 19} fill="#64748b" fontSize="7" textAnchor="end"
            fontFamily="ui-monospace, monospace">{name}</text>
          <rect x="78" y={12 + i * 19} width="112" height="12" rx="6" fill="#f1f5f9" />
          <rect x="78" y={12 + i * 19} width={w} height="12" rx="6"
            fill="#6366f1" opacity={1 - i * 0.13} />
        </g>
      ))}
    </svg>
  )
}

export function ResultArt() {
  const angle = Math.PI * (1 - 0.68)
  const x = 100 + 60 * Math.cos(angle)
  const y = 88 - 60 * Math.sin(angle)

  return (
    <svg viewBox="0 0 200 110" className="w-full h-auto max-w-[200px] mx-auto" aria-hidden="true">
      <path d="M40 88 A60 60 0 0 1 160 88" fill="none" stroke="#e2e8f0" strokeWidth="12"
        strokeLinecap="round" />
      <path d={`M40 88 A60 60 0 0 1 ${x} ${y}`} fill="none" stroke="#10b981" strokeWidth="12"
        strokeLinecap="round" />
      <path d="M92 62 L100 50 L108 62 Z" fill="#10b981" />
      <text x="100" y="82" fill="#0f172a" fontSize="20" fontWeight="600" textAnchor="middle">68%</text>
      <text x="100" y="104" fill="#64748b" fontSize="10" textAnchor="middle" letterSpacing="1">CONFIDENCE</text>
    </svg>
  )
}
