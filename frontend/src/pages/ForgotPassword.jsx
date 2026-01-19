import Button from "../components/Button"
import TextLink from "../components/TextLink"

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

        <Button>
          Send reset link
        </Button>
      </div>

      <div className="mt-4 text-sm">
        <TextLink to="/login">
          Back to Log In
        </TextLink>
      </div>
    </div>
  )
}

export default ForgotPassword
