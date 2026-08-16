export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  ...props
}) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    rounded-lg font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    hover:shadow-lg active:scale-95
    disabled:opacity-50 disabled:pointer-events-none
  `

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2",
  }

  const variants = {
    primary: `
      bg-indigo-600 text-white
      hover:bg-indigo-700
      active:bg-indigo-800
      focus:ring-indigo-500
    `,
    secondary: `
      border border-slate-300 bg-white text-slate-700
      hover:bg-slate-100
      active:bg-slate-200
      focus:ring-slate-400
    `,
    outline: `
      border border-slate-500 text-slate-100
      hover:bg-slate-800 hover:border-slate-400
      active:bg-slate-700
      focus:ring-slate-400
    `,
    success: `
      bg-emerald-600 text-white
      hover:bg-emerald-700
      active:bg-emerald-800
      focus:ring-emerald-500
    `,
    danger: `
      border border-red-200 bg-white text-red-600
      hover:bg-red-50 hover:border-red-300
      active:bg-red-100
      focus:ring-red-400
    `,
  }

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
