import { Link } from "react-router-dom"

function Home() {
    return (
        <div className="min-h-screen flex flex-col justify-center px-6">
            <div className="max-w-3xl mx-auto text-center">


<h1 className="text-6xl text-red-600 font-bold">
  TEST TAILWIND
</h1>
                {/* Welcome */}
                <h1 className="text-4xl font-semibold mb-4 text-gray-900">
                    Welcome to Stock Prediction Platform
                </h1>

                <p className="text-gray-600 text-lg mb-8">
                    A machine learning–powered platform designed to predict whether a stock
                    will go up or down by the end of the trading day.
                </p>

                {/* Description */}
                <div className="text-gray-700 text-base space-y-4 mb-10">
                    <p>
                        Our models analyze historical market data and patterns to provide
                        daily directional predictions for selected stocks.
                    </p>

                    <p>
                        This platform is built for educational and analytical purposes,
                        helping users explore the potential of machine learning in financial
                        markets.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Link
                        to="/login"
                        className="px-6 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    >
                        Log In
                    </Link>

                    <Link
                        to="/register"
                        className="px-6 py-2 rounded border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
                    >
                        Register
                    </Link>
                </div>

            </div>
        </div>
    )
}

export default Home
