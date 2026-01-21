export default function ActionButton({ label, secondary }) {
  const base =
    "px-4 py-2 rounded-md font-medium transition"

  const primary =
    "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white"

  const secondaryStyle =
    "border border-slate-700 text-slate-300 hover:bg-slate-900"

  return (
    <button
      className={`${base} ${
        secondary ? secondaryStyle : primary
      }`}
    >
      {label}
    </button>
  )
}
