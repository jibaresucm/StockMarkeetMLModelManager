export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-center text-slate-900">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-3 text-center text-slate-600">
            {subtitle}
          </p>
        )}

        <div className="mt-8">
          {children}
        </div>

        {footer && (
          <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
            {footer}
          </div>
        )}

      </div>
    </section>
  )
}

export function Field({ error, ...props }) {
  return (
    <div>
      <input
        {...props}
        className="w-full border border-slate-300 px-4 py-3 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}
