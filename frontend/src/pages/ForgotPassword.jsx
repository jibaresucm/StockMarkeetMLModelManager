import { Link } from "react-router-dom"
import Button from "../components/Button"

export default function ForgotPassword() {
  return (
    <div className="max-w-md mx-auto mt-20 px-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">Reset Password</h1>
      <p className="text-gray-600 text-center mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" placeholder="you@example.com" />
        </div>
        <div className="flex justify-center">
            <Link to="/login" className="w-full">
                <Button className="w-full justify-center">Send Reset Link</Button>
            </Link>
        </div>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        <Link to="/login" className="text-blue-600 hover:underline">Back to Log In</Link>
      </p>
    </div>
  )
}