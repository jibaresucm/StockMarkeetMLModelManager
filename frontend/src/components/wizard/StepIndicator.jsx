import { Check } from "lucide-react"

const STEPS = ["Name & Description", "Ticker & Period", "Features", "Algorithm"]

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center w-full px-8 py-4">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center">
          {/* Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${i < currentStep
                  ? "bg-indigo-500 text-white"
                  : i === currentStep
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-2"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
            >
              {i < currentStep ? <Check size={16} /> : i + 1}
            </div>
            <span
              className={`mt-2 text-xs whitespace-nowrap
                ${i <= currentStep ? "text-slate-700 font-medium" : "text-slate-400"}`}
            >
              {label}
            </span>
          </div>

          {/* Connecting line */}
          {i < STEPS.length - 1 && (
            <div
              className={`w-20 h-0.5 mx-2 mb-6 transition-all
                ${i < currentStep ? "bg-indigo-500" : "bg-slate-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
