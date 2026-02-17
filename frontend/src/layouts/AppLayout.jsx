import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

export default function AppLayout({ isAuthenticated, setIsAuthenticated }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <main className="flex-1 flex items-center justify-center px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
