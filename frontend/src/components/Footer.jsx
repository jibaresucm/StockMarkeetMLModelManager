export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-indigo-900 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-slate-400 flex flex-col md:flex-row justify-between gap-6">

        {/* Left */}
        <div>
          <p className="text-slate-300 font-medium">
            PITO Future
          </p>
          <p className="mt-1">
            Machine learning–powered stock predictions.
          </p>
        </div>

        {/* Center */}
        <div className="space-y-1">
          <p className="text-slate-300 font-medium">Legal</p>
          <p className="hover:text-white transition cursor-pointer">
            Disclaimer
          </p>
          <p className="hover:text-white transition cursor-pointer">
            Terms of Service
          </p>
        </div>

        {/* Right */}
        <div className="text-right">
          <p className="text-slate-300 font-medium">Project</p>
          <p className="mt-1">
            © {new Date().getFullYear()} PITO Future
          </p>
          <p className="text-xs mt-1 text-slate-500">
            Educational purposes only
          </p>
        </div>

      </div>
    </footer>
  )
}
