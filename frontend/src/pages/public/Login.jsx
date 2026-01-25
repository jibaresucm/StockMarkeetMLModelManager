  import { useState } from "react";
  import { Link } from "react-router-dom"
  import Button from "../../components/Button.jsx"
  import TextLink from "../../components/TextLink.jsx"
  import { useNavigate } from "react-router-dom";

  const MOCK_USER = {
    email: "test@test.com",
    password: "123456",
  };

  function Login() {
    const navigate = useNavigate();
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
      const email= formData.email.trim().toLowerCase();
      const password = formData.password.trim();
      if (!email) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Must be a valid email";
      }
      if (!password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      return newErrors;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log("SUBMIT FIRED");

      const validationErrors = validate();
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        const email = formData.email.trim().toLowerCase();
        const password = formData.password.trim();

        if (
          email === MOCK_USER.email &&
          password === MOCK_USER.password
        ) {
          console.log("LOGIN OK");
          navigate("/app")
        } else {
          setErrors({
            email: "Invalid email or password",
            password: "Invalid email or password",
          });
        }
      }
    };

    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6">
            Log In
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                name="email"
                placeholder="Email"
                className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <Button type="submit">
              Log In
            </Button>
          </form>

          <div className="mt-4 text-sm text-center text-indigo-600">
            <TextLink to="/forgot-password">
              Forgot your password?
            </TextLink>
          </div>

          <div className="mt-2 text-sm text-center">
            Don’t have an account?{" "}
            <TextLink to="/register">
              Register
            </TextLink>
          </div>
        </div>
      </div>
    );
  }



  export default Login;
