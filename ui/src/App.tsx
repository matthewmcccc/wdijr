import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { createContext } from "react";
import NetworkGraph from "./pages/NetworkGraph"
import Home from "./pages/Home"
import GraphTest from "./pages/GraphTest"
import AnalysisLanding from "./pages/AnalysisOverview"
import CharacterAnalysis from "./pages/CharacterAnalysis"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/network-graph" element={<NetworkGraph />} />
        <Route path="/analysis" element={<AnalysisLanding />} />
        <Route path="/character-analysis" element={<CharacterAnalysis />} />
        <Route path="/" element={<Home />} />
        <Route path="/graph-test" element={<GraphTest />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
