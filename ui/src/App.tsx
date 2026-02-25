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
    "Catherine": {
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "traits": ["Headstrong", "Impulsive", "Loyal"],
    },
    "Edgar": {
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

const topCharacterRelationships: Record<string, [string, number][]> = 
  {'heathcliff': [['joseph', 19], ['isabella linton', 17], ['catherine earnshaw', 14]], 'joseph': [['heathcliff', 19], ['catherine earnshaw', 13], ['nelly', 11]], 'hareton': [['joseph', 5], ['nelly', 3], ['heathcliff', 3]], 'jabez': [['zillah', 1], ['lockwood', 1]], 'ellen dean': [['catherine', 18], ['linton', 7], ['cathy', 6]], 'catherine earnshaw': [['linton', 18], ['catherine', 15], ['isabella linton', 14]], 'miss': [['catherine', 6], ['joseph', 3], ['nelly', 2]], 'hindley': [['catherine earnshaw', 3], ['joseph', 2], ['isabella linton', 1]], 'nelly': [['joseph', 11], ['heathcliff', 5], ['catherine', 4]], 'isabella': [['isabella linton', 6], ['catherine earnshaw', 3], ['linton', 2]], 'isabella linton': [['heathcliff', 17], ['catherine earnshaw', 14], ['linton', 14]], 'catherine': [['ellen dean', 18], ['catherine earnshaw', 15], ['heathcliff', 10]], 'linton': [['catherine earnshaw', 18], ['isabella linton', 14], ['heathcliff', 10]], 'dean': [['cathy', 2], ['frances', 1]], 'cathy': [['catherine earnshaw', 9], ['isabella linton', 9], ['linton', 6]], 'edgar': [['isabella linton', 9], ['heathcliff', 8], ['catherine', 7]], 'ellen': [['isabella linton', 5], ['catherine earnshaw', 5], ['joseph', 2]], 'kenneth': [['catherine earnshaw', 2], ['isabella linton', 1], ['heathcliff', 1]], 'papa': [['catherine', 2], ['cathy', 2], ['isabella linton', 1]], 'zillah': [['linton', 2], ['edgar', 2], ['heathcliff', 1]], 'green': [['linton', 1], ['joseph', 1]], 'lockwood': [['nelly', 2], ['joseph', 1], ['jabez', 1]]}

const navigationData = Object.keys(characterData)

const App = () => {
  return (
    <BrowserRouter>
      <BookContext.Provider value={{
          characterData,
          characterNavigationDict: buildNavigationDictionary(navigationData),
          topCharacterRelationships,
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
