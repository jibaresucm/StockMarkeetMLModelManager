import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">

        {/* Left: Brand */}
        <div className="flex-1">
          <Link
            to="/"
            className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition"
          >
            PITO Future
          </Link>
        </div>

        {/* Center: Home */}
        <div className="flex-1 text-center">
          <Link
            to="/"
            className="text-gray-700 hover:text-gray-900 transition font-medium"
          >
            Home
          </Link>
        </div>

        {/* Right: Account */}
        <div className="flex-1 flex justify-end">
          <Link
            to="/login"
            className="
              text-gray-700 font-medium
              transition
              hover:text-gray-900
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
            "
          >
            Account
          </Link>
        </div>

      </div>
    </nav>
  )
}
