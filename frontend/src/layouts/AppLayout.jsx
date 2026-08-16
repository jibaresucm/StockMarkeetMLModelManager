import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

export default function AppLayout({ isAuthenticated, setIsAuthenticated, user }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} />

      <main className="flex-1 min-w-0 px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
