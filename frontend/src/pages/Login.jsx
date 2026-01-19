import { Link } from "react-router-dom"

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

        <button className="bg-blue-600 text-white py-2 rounded">
          Log In
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <Link to="/forgot" className="underline">
          Forgot your password?
        </Link>
      </div>

      <div className="mt-2 text-sm">
        Don’t have an account?{" "}
        <Link to="/register" className="underline">
          Register
        </Link>
      </div>
    </div>
  )
}

export default Login
