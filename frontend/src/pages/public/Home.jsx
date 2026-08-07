import { Link } from "react-router-dom"
import { BrainCircuit, CandlestickChart, Gauge } from "lucide-react"
import Button from "../../components/Button"
import { PredictionMockup, TickerArt, FeaturesArt, ResultArt } from "../../components/HomeArt"

function Hero() {
  return (
    <section className="min-h-screen flex items-center bg-gradient-to-b from-slate-950 to-slate-900 text-white px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* Texto */}
        <div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Predict the Market. <br />
            <span className="text-indigo-400">Trade Smarter.</span>
          </h1>

          <p className="text-slate-300 mb-10 text-lg">
            Use machine learning models to forecast whether a stock will go up
            or down by the end of the trading day.
          </p>

          <div className="flex gap-4">
            <Link to="/login">
              <Button>Log In</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Register</Button>
            </Link>
          </div>
        </div>

        {/* Imagen / mockup */}
        <div className="hidden md:block">
          <PredictionMockup />
        </div>

      </div>
    </section>
  )
}

function Numbers() {
  const stats = [
    ["26", "technical features"],
    ["10", "ML algorithms"],
    ["2", "labeling targets"],
    ["2", "sampling methods"],
  ]

  return (
    <section className="bg-slate-900 border-y border-slate-800 py-12 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map(([value, label]) => (
          <div key={label}>
            <p className="text-4xl font-bold text-indigo-400">{value}</p>
            <p className="mt-1 text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function WhatYouCanDo() {
  const cards = [
    {
      icon: BrainCircuit,
      title: "AI Predictions",
      text: "Our models analyze patterns to forecast daily stock direction.",
    },
    {
      icon: CandlestickChart,
      title: "Real Market Data",
      text: "Work with updated financial data to power predictions.",
    },
    {
      icon: Gauge,
      title: "Performance Tracking",
      text: "See how accurate your predictions and the model are over time.",
    },
  ]

  return (
    <section className="py-24 bg-slate-50 text-center px-6">
      <h2 className="text-3xl font-bold mb-12">
        Make Data-Driven Market Decisions
      </h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {cards.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
              <Icon size={26} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            <p className="text-gray-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { art: TickerArt, title: "Choose a Stock", text: "Select the stock you want to analyze." },
    { art: FeaturesArt, title: "Run Prediction", text: "The ML model processes market signals." },
    { art: ResultArt, title: "View Results", text: "See probability, direction & confidence." },
  ]

  return (
    <section className="py-24 bg-white px-6">
      <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>

      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 text-center">
        {steps.map(({ art: Art, title, text }, i) => (
          <div key={title}>
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <Art />
            </div>
            <div className="text-4xl font-bold text-indigo-500 mb-4">{i + 1}</div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="bg-slate-50 pt-24 pb-8 px-6">
      <div className="max-w-4xl mx-auto text-center">

        <h2 className="text-3xl font-bold text-slate-900 mb-6">
          Ready to Start Predicting?
        </h2>

        <p className="text-gray-600 text-lg mb-10">
          Join the platform and use machine learning to forecast stock movements.
        </p>

        <div className="flex justify-center gap-4">
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>

          <Link to="/login">
            <Button variant="secondary">Log In</Button>
          </Link>
        </div>

      </div>
    </section>
  )
}

function Home() {
  return (
    <>
      <Hero />
      <Numbers />
      <WhatYouCanDo />
      <HowItWorks />
      <FinalCTA />
    </>
  )
}


export default Home