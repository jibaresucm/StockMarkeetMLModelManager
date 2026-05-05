import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { auth } from "./api.js"
import PublicLayout from "./layouts/PublicLayout"
import AppLayout from "./layouts/AppLayout"

import Home from "./pages/public/Home"
import Login from "./pages/public/Login"
import Register from "./pages/public/Register"
import ForgotPassword from "./pages/public/ForgotPassword"

import Dashboard from "./pages/app/Dashboard"
import Profile from "./pages/app/Profile"
import Projects from "./pages/app/Projects"
import Project from "./pages/app/Project"
import Models from "./pages/app/Models"
import Model from "./pages/app/Model"

function App() {
  console.log("App component rendered")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auth.me()
      .then(userData => {
        setUser(userData)
        setIsAuthenticated(true)
      })
      .catch(() => {
        setIsAuthenticated(false)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route
          element={
            isAuthenticated ? (
              <AppLayout isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="/app" element={<Dashboard user={user} />} />
          <Route path="/app/profile" element={<Profile user={user} />} />
          <Route path="/app/projects" element={<Projects />} />
          <Route path="/app/projects/:id" element={<Project />} />
          <Route path="/app/models" element={<Models />} />
          <Route path="/app/models/:id" element={<Model />} />
        </Route>


      </Routes>
    </BrowserRouter>
  )
}

export default App
