import { Outlet } from "react-router-dom"

export default function AppLayout() {
  return (
    <div style={{ background: "red", minHeight: "100vh", color: "white" }}>
      <h1>APP LAYOUT OK</h1>
      <Outlet />
    </div>
  )
}
