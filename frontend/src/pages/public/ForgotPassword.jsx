import { useState } from "react";
import Button from "../../components/Button"
import TextLink from "../../components/TextLink"
import AuthCard, { Field } from "../../components/AuthCard.jsx"

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
    <AuthCard
      title="Reset Password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      footer={<TextLink to="/login">Back to Log In</TextLink>}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {message && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 text-sm text-center">
            {message}
          </p>
        )}
        {errors.api && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm text-center">
            {errors.api}
          </p>
        )}

        <Field
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <Button type="submit" className="w-full">Send Reset Link</Button>
      </form>
    </AuthCard>
  )
}