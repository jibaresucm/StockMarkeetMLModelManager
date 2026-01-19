import { Link } from "react-router-dom"

export default function TextLink({ to, children }) {
  return (
    <Link
      to={to}
      className="
        underline text-gray-600
        transition duration-150
        hover:text-gray-900
        active:text-gray-800
        focus:outline-none
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      "
    >
      {children}
    </Link>
  )
}
