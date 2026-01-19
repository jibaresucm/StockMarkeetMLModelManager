import Button from "../components/Button"
import TextLink from "../components/TextLink"

function Register() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-6">Register</h1>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <input type="text" placeholder="Name" className="border p-2 rounded" />
        <input type="email" placeholder="Email" className="border p-2 rounded" />
        <input type="password" placeholder="Password" className="border p-2 rounded" />

        <Button>
          Create Account
        </Button>
      </div>

      <div className="mt-4 text-sm">
        Already have an account?{" "}
        <TextLink to="/login">
          Log In
        </TextLink>
      </div>
    </div>
  )
}

export default Register
