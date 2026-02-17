import { useState } from "react";
import Button from "../../components/Button"
import TextLink from "../../components/TextLink"

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // This is a mock API call.
      // In a real app, you would send a request to your backend.
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Password reset link sent to:", email);
      setMessage("If an account with that email exists, a password reset link has been sent.");
      setEmail("");
    } catch {
      setErrors({ api: "Failed to send reset link. Please try again." });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">Reset Password</h1>
      <p className="text-gray-600 text-center mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {message && <p className="text-green-600 text-sm text-center">{message}</p>}
        {errors.api && <p className="text-red-500 text-sm text-center">{errors.api}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <Button type="submit">Send Reset Link</Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        <TextLink to="/login">Back to Log In</TextLink>
      </p>
    </div>
  )
}