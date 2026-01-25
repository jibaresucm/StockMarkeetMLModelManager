import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="w-full border-b border-indigo-700 bg-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left: Brand & Primary Nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-500">
                PRED Future
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-indigo-700 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              {/* <Link
                to="/app"
                className="border-transparent text-indigo-700 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link> */}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center">
            <Link
              to="/login"
              className="text-indigo-700 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign up
            </Link>
          </div>

        </div>
      </div>
    </nav>
  )
}