import { NavLink } from "react-router-dom"

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">

      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-indigo-500 font-semibold tracking-wide text-lg">
          PITO Future
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <SidebarLink to="/app" label="Home" />
        <SidebarLink to="/app/projects" label="Projects" />
        <SidebarLink to="/app/models" label="Models" />
        <SidebarLink to="/app/profile" label="Profile" />
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800 text-sm text-slate-400">
        Logged in
      </div>

    </aside>
  )
}


function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `
        flex items-center px-3 py-2 rounded-md text-sm font-medium
        transition
        ${
          isActive
            ? "bg-slate-800 text-indigo-400"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }
        `
      }
    >
      {label}
    </NavLink>
  )
}
