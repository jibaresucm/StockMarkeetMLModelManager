import { NavLink, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { auth } from "../api"

export default function Sidebar({ user }) {
    const navigate = useNavigate()

    const handleLogout = async () => {
        try { await auth.logout() } catch { }
        navigate("/login", { replace: true })
    }

    return (
        <aside className="w-64 min-h-screen bg-gray-200 border-r border-indigo-800 flex flex-col">

            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-indigo-800">
                <span className="text-indigo-700 font-semibold tracking-wide text-lg">
                    PRED Future
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
            <div className="px-6 py-4 border-t border-indigo-800 text-sm text-slate-900">
                <div className="flex items-center justify-between">

                    {/* User name */}
                    <span className="font-medium text-indigo-700 truncate">
                        {user?.username ?? ""}
                    </span>

                    {/* Icons */}
                    <div className="flex items-center gap-3 text-indigo-700">

                        <button onClick={handleLogout} className="hover:text-red-600 transition">
                            <LogOut size={18} />
                        </button>

                    </div>

                </div>
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
        ${isActive
                    ? "bg-indigo-800 text-gray-50"
                    : "text-gray-900 hover:bg-indigo-800 hover:text-white"
                }
        `
            }
        >
            {label}
        </NavLink>
    )
}
