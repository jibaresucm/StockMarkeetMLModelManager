import { Link } from "react-router-dom"
import Button from "../components/Button"
import TextLink from "../components/TextLink.jsx"

function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-6">Log In</h1>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
        />

        <Button>
          Log In
        </Button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <TextLink to="/forgot">
          Forgot your password?
        </TextLink>
      </div>

      <div className="mt-2 text-sm">
        Don’t have an account?{" "}
        <TextLink to="/register">
          Register
        </TextLink>
      </div>
    </div>
  )
}

export default Login
