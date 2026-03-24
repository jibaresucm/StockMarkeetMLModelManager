import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

export default function AppLayout({ isAuthenticated, setIsAuthenticated, user }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex flex-col flex-1">
        <main className="flex-1 flex items-center justify-center px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
