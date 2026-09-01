import { Link } from "react-router-dom"

export default function TextLink({ to, children }) {
  return (
    <Link
      to={to}
      className="
        font-medium text-indigo-600
        transition duration-150
        hover:text-indigo-800 hover:underline
        active:text-indigo-900
        focus:outline-none
        focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded
      "
    >
      {children}
    </Link>
  )
}
