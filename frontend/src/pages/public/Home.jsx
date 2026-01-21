import { Link } from "react-router-dom"
import Button from "../../components/Button"

function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-semibold mb-6">
          Welcome to Stock Prediction Platform
        </h1>

        <p className="text-gray-600 mb-10">
          Predict whether a stock will go up or down by the end of the trading day
          using machine learning.
        </p>

        <div className="flex justify-center gap-4">
          <Link to="/login">
            <Button>Log In</Button>
          </Link>

          <Link to="/register">
            <Button variant="secondary">Register</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
