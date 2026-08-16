export default function ActionButton({ label, secondary, icon: Icon, onClick }) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95"

  const primary =
    "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white hover:shadow-lg"

  const secondaryStyle =
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:shadow-sm"

  return (
    <button
      onClick={onClick}
      className={`${base} ${
        secondary ? secondaryStyle : primary
      }`}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  )
}
