import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../components/Button.jsx"
import TextLink from "../../components/TextLink.jsx"
import AuthCard, { Field } from "../../components/AuthCard.jsx"
import { auth } from "../../api.js"

function Login({ setIsAuthenticated, setUser }) {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
      email: "",
      password: "",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
      const newErrors = {};
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.password) newErrors.password = "Password is required";
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
        await auth.login(formData.email, formData.password)
        const userData = await auth.me()
        setUser(userData);
        setIsAuthenticated(true);
        navigate("/app");
      } catch (err) {
        setErrors({ api: err.message || "Login failed. Please try again." });
      }
    };

    return (
      <AuthCard
        title="Log In"
        subtitle="Welcome back. Pick up where you left off."
        footer={
          <>
            <p>
              <TextLink to="/forgot-password">Forgot your password?</TextLink>
            </p>
            <p className="mt-2">
              Don't have an account? <TextLink to="/register">Register</TextLink>
            </p>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errors.api && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm text-center">
              {errors.api}
            </p>
          )}

          <Field
            type="text"
            name="email"
            placeholder="Email"
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

          <Button type="submit" className="w-full">
            Log In
          </Button>
        </form>
      </AuthCard>
    );
  }



  export default Login;
