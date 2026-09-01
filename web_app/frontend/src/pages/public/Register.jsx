import Button from "../../components/Button"
import TextLink from "../../components/TextLink"
import AuthCard, { Field } from "../../components/AuthCard.jsx"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../../api.js"

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const { username, email, password } = formData
      await auth.register(username, email, password)
      navigate("/login");
    } catch (err) {
      setErrors({ api: err.message || "Registration failed. Please try again." });
    }
  };
  return (
    <AuthCard
      title="Create Account"
      subtitle="Start building your own prediction models."
      footer={
        <p>
          Already have an account? <TextLink to="/login">Log In</TextLink>
        </p>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {errors.api && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm text-center">
            {errors.api}
          </p>
        )}

        <Field
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />

        <Field
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Field
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Field
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
    </AuthCard>
  )
}