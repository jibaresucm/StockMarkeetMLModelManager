export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Stock Prediction Platform. All rights reserved.</p>
      </div>
    </footer>
  )
}
