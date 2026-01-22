import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import PublicLayout from "./layouts/PublicLayout"
import AppLayout from "./layouts/AppLayout"

import Home from "./pages/public/Home"
import Login from "./pages/public/Login"
import Register from "./pages/public/Register"
import ForgotPassword from "./pages/public/ForgotPassword"

import Dashboard from "./pages/app/Dashboard"
import Profile from "./pages/app/Profile"
import Projects from "./pages/app/Projects"
import Models from "./pages/app/Models"

const isAuthenticated = true

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route
          element={
            isAuthenticated
              ? <AppLayout />
              : <Navigate to="/login" />
          }
        >
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/profile" element={<Profile />} />
          <Route path="/app/projects" element={<Projects />} />
          <Route path="/app/models" element={<Models />} />
        </Route>


      </Routes>
    </BrowserRouter>
  )
}

export default App
