import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import About from "./About.jsx"

function App() {


  return (
    <BrowserRouter>
    <Routes>
      <Route path = "/" element = {<About />}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App
