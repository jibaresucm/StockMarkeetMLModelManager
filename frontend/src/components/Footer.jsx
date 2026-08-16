import { TrendingUp } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-slate-400 flex flex-col md:flex-row justify-between gap-6">

        {/* Left */}
        <div>
          <p className="flex items-center gap-2 text-slate-100 font-medium">
            <TrendingUp size={16} className="text-indigo-400" />
            PRED Future
          </p>
          <p className="mt-2">
            Machine learning–powered stock predictions.
          </p>
        </div>

        {/* Center */}
        <div className="space-y-1">
          <p className="text-slate-100 font-medium">Legal</p>
          <p className="hover:text-white transition cursor-pointer">
            Disclaimer
          </p>
          <p className="hover:text-white transition cursor-pointer">
            Terms of Service
          </p>
        </div>

        {/* Right */}
        <div className="md:text-right">
          <p className="text-slate-100 font-medium">Project</p>
          <p className="mt-2">
            © {new Date().getFullYear()} PRED Future
          </p>
        </div>

      </div>
    </footer>
  )
}
