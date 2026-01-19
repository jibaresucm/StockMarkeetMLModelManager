import { Link } from "react-router-dom"

function ForgotPassword() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-4">Reset Password</h1>

      <p className="text-gray-600 mb-6 text-center max-w-sm">
        Enter your email address and we’ll send you a link to reset your password.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
        />

        <button className="bg-blue-600 text-white py-2 rounded">
          Send reset link
        </button>
      </div>

      <div className="mt-4 text-sm">
        <Link to="/login" className="underline">
          Back to Log In
        </Link>
      </div>
    </div>
  )
}

export default ForgotPassword
