import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex items-center justify-center px-6">
        <Outlet />
      </main>
    </div>
  )
}
