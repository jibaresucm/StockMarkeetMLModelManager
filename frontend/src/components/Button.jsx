export default function Button({
  children,
  variant = "primary",
  type = "button",
  ...props
}) {
  const baseClasses = `
    inline-flex items-center justify-center
    px-6 py-2 rounded font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    hover:shadow-lg active:scale-95
  `

  const variants = {
    primary: `
      bg-indigo-600 text-white
      hover:bg-indigo-700 hover:bg-opacity-90
      active:bg-indigo-800
      focus:ring-indigo-500
    `,
    secondary: `
      border border-gray-300 text-gray-700
      hover:bg-gray-100
      active:bg-gray-200
      focus:ring-gray-400
    `,
  }

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  )
}
