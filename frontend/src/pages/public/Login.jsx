import { Link } from "react-router-dom"
import Button from "../../components/Button.jsx"
import TextLink from "../../components/TextLink.jsx"

function Login() {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          Log In
        </h1>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <Button>
            Log In
          </Button>
        </div>

        <div className="mt-4 text-sm text-center text-indigo-600">
          <TextLink to="/forgot-password">
            Forgot your password?
          </TextLink>
        </div>

        <div className="mt-2 text-sm text-center">
          Don’t have an account?{" "}
          <TextLink to="/register">
            Register
          </TextLink>
        </div>
      </div>
    </div>
  )
}



export default Login
