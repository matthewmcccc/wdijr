import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import buildNavigationDictionary from "./utils/buildNavigationDictionary";
import NetworkGraph from "./components/NetworkGraph"
import Home from "./pages/Home"
import GraphTest from "./components/GraphTest"
import AnalysisLanding from "./pages/AnalysisOverview"
import CharacterAnalysisOverview from "./pages/CharacterAnalysisOverview"
import CharacterAnalysis from "./pages/CharacterAnalysis";
import PlotAnalysisOverview from "./pages/PlotAnalysisOverview";
import { createContext } from "react";
import { BookContext } from "./contexts/bookContext";

const characterData = {
    "Heathcliff": {
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "traits": ["Brooding", "Passionate", "Vengeful"],
    },
    "Catherine Earnshaw": {
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "traits": ["Headstrong", "Impulsive", "Loyal"],
    },
    "Edgar Linton": {
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "traits": ["Refined", "Gentle", "Protective"],
    },
    "Isabella Linton": {
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "traits": ["Naive", "Romantic", "Resilient"],
    },
    "Hindley Earnshaw": {
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "traits": ["Jealous", "Resentful", "Tragic"],
    },
}

const navigationData = Object.keys(characterData)

const App = () => {
  return (
    <BrowserRouter>
      <BookContext.Provider value={{
          characterData,
          characterNavigationDict: buildNavigationDictionary(navigationData),
        }}>
        <Routes>
          <Route path="/network-graph" element={<NetworkGraph />} />
          <Route path="/analysis" element={<AnalysisLanding />} />
          <Route path="/character-analysis" element={<CharacterAnalysisOverview />} />
          <Route path="/character/:name" element={<CharacterAnalysis />} />
          <Route path="/" element={<Home />} />
          <Route path="/graph-test" element={<GraphTest />} />
          <Route path="/plot-analysis" element={<PlotAnalysisOverview />} />
        </Routes>
      </BookContext.Provider>
    </BrowserRouter>
  )
}

export default App
