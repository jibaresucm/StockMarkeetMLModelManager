import { NavLink, useNavigate } from "react-router-dom"
import { LogOut, LayoutDashboard, FolderKanban, BrainCircuit, User, TrendingUp } from "lucide-react"
import { auth } from "../api"

const links = [
    { to: "/app", label: "Home", icon: LayoutDashboard },
    { to: "/app/projects", label: "Projects", icon: FolderKanban },
    { to: "/app/models", label: "Models", icon: BrainCircuit },
    { to: "/app/profile", label: "Profile", icon: User },
]

export default function Sidebar({ user }) {
    const navigate = useNavigate()

    const handleLogout = async () => {
        try { await auth.logout() } catch { }
        navigate("/login", { replace: true })
    }

    return (
        <aside className="w-64 shrink-0 bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800 flex flex-col">

            {/* Brand */}
            <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-800">
                <TrendingUp size={20} className="text-indigo-400" />
                <span className="text-white font-semibold tracking-wide text-lg">
                    PRED Future
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {links.map(link => (
                    <SidebarLink key={link.to} {...link} />
                ))}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-slate-800">
                <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-900/60 px-3 py-2">

                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">
                            {user?.username ?? ""}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {user?.email ?? ""}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        title="Log out"
                        className="text-slate-400 hover:text-red-400 transition shrink-0"
                    >
                        <LogOut size={18} />
                    </button>

                </div>
            </div>

        </aside>
    )
}


function SidebarLink({ to, label, icon: Icon }) {
    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) =>
                `
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
        transition
        ${isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
        `
            }
        >
            <Icon size={18} />
            {label}
        </NavLink>
    )
}
