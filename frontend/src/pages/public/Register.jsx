import { Link } from "react-router-dom"
import Button from "../../components/Button"
import TextLink from "../../components/TextLink"

export default function Register() {
  return (
    <div className="max-w-md mx-auto mt-20 px-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">Create Account</h1>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" placeholder="John Doe" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" placeholder="you@example.com" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" placeholder="********" />
        </div>
        <div className="flex text-center">
             <Link to="/login" className="w-full">
                <Button>Register</Button>
             </Link>
        </div>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account? <TextLink to="/login">Log In</TextLink>
      </p>
    </div>
  )
}