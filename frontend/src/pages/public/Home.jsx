import { Link } from "react-router-dom" 
import Button from "../../components/Button"

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
              <Button variant="secondary">Register</Button>
            </Link>
          </div>
        </div>

        {/* Imagen / mockup */}
        <div className="hidden md:block">
          <div className="bg-slate-800 rounded-xl h-80 shadow-2xl border border-slate-700" />
        </div>

      </div>
    </section>
  )
}

function WhatYouCanDo() {
  return (
    <section className="py-24 bg-slate-50 text-center px-6">
      <h2 className="text-3xl font-bold mb-12">
        Make Data-Driven Market Decisions
      </h2>

      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        <div>
          <h3 className="text-xl font-semibold mb-3">AI Predictions</h3>
          <p className="text-gray-600">
            Our models analyze patterns to forecast daily stock direction.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Real Market Data</h3>
          <p className="text-gray-600">
            Work with updated financial data to power predictions.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Performance Tracking</h3>
          <p className="text-gray-600">
            See how accurate your predictions and the model are over time.
          </p>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="py-24 bg-white px-6">
      <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>

      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 text-center">
        <div>
          <div className="text-4xl font-bold text-indigo-500 mb-4">1</div>
          <h3 className="font-semibold mb-2">Choose a Stock</h3>
          <p className="text-gray-600">Select the stock you want to analyze.</p>
        </div>

        <div>
          <div className="text-4xl font-bold text-indigo-500 mb-4">2</div>
          <h3 className="font-semibold mb-2">Run Prediction</h3>
          <p className="text-gray-600">The ML model processes market signals.</p>
        </div>

        <div>
          <div className="text-4xl font-bold text-indigo-500 mb-4">3</div>
          <h3 className="font-semibold mb-2">View Results</h3>
          <p className="text-gray-600">See probability, direction & confidence.</p>
        </div>
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
      <WhatYouCanDo />
      <HowItWorks />
      <FinalCTA />
    </>
  )
}


export default Home