import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { createContext } from "react";
import NetworkGraph from "./pages/NetworkGraph"
import Home from "./pages/Home"
import AnalysisLanding from "./pages/AnalysisLanding"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/network-graph" element={<NetworkGraph />} />
        <Route path="/analysis" element={<AnalysisLanding />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
