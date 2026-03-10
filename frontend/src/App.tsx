import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import buildNavigationDictionary from "./utils/buildNavigationDictionary";
import NetworkGraph from "./components/NetworkGraph"
import Home from "./pages/Home"
import GraphTest from "./components/GraphTest"
import AnalysisLanding from "./pages/AnalysisLanding"
import CharacterAnalysisLanding from "./pages/CharacterAnalysisOverview"
import CharacterAnalysisProfile from "./pages/CharacterAnalysisProfile";
import { useState } from "react";
import { BookContext } from "./contexts/bookContext";
import * as quotesData from "../data/quotes.json"
import PlotAnalysisLanding from "./pages/PlotAnalysisOverview";
import Processing from "./pages/Processing";


const App = () => {
  const [characterData, setCharacterData] = useState<Array<{ id: Number, name: string, summary: string, description: string, novel_id: string }>>([])
  const [networkData, setNetworkData] = useState<{ links: any[], nodes: any[] }>({ links: [], nodes: [] })
  const [novelData, setNovelData] = useState<{ author: string; id: string; title: string } | null>(null);
  const [associatedQuotes, setAssociatedQuotes] = useState<Record<string, { quote: string, sentiment: number }[]> | undefined>(undefined);
  const [topCharacterRelationships, setTopCharacterRelationships] = useState<Record<string, [string, number][]>>();
  const [title, setTitle] = useState("");
  const [topCharacterQuotes, setTopCharacterQuotes] = useState<Record<string, any>>();
  const [attributedQuotes, setAttributedQuotes] = useState<any[]>([]);
  const [quoteData, setQuoteData] = useState<any>(quotesData);
  const [sentimentValues, setSentimentValues] = useState<any>(null);
  const [inflectionPoints, setInflectionPoints] = useState<any>(null);
  const [plotSummaries, setPlotSummaries] = useState<any>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);


  return (
    <BrowserRouter>
      <BookContext.Provider value={{
          characterData: characterData,
          setCharacterData: setCharacterData,
          networkData: networkData,
          setNetworkData: setNetworkData,
          sentimentValues: sentimentValues,
          setSentimentValues: setSentimentValues,
          inflectionPoints: inflectionPoints,
          setInflectionPoints: setInflectionPoints,
          title: title,
          setTitle: setTitle,
          novelData: novelData ?? { author: "", id: "", title: "" },
          setNovelData: setNovelData,
          characterNavigationDict: buildNavigationDictionary(Object.keys(topCharacterRelationships ?? {})),
          associatedQuotes: associatedQuotes ?? {},
          setAssociatedQuotes: setAssociatedQuotes,
          topCharacterRelationships: topCharacterRelationships ?? {},
          topCharacterQuotes: topCharacterQuotes ?? {},
          attributedQuotes: attributedQuotes ?? [],
          setTopCharacterRelationships: setTopCharacterRelationships,
          quoteData: quoteData,
          setQuoteData: setQuoteData,
          plotSummaries: plotSummaries,
          setPlotSummaries: setPlotSummaries,
          coverUrl: coverUrl,
          setCoverUrl: setCoverUrl,
        }}>
        <Routes>
          <Route path="/network-graph" element={<NetworkGraph />} />
          <Route path="/processing/:taskid" element={<Processing />} />
          <Route path="/analysis/:novelId" element={<AnalysisLanding />} />
          <Route path="/character-analysis/:novelId" element={<CharacterAnalysisLanding />} />
          <Route path="/character/:novelId/:name" element={<CharacterAnalysisProfile />} />
          <Route path="/" element={<Home />} />
          <Route path="/graph-test" element={<GraphTest />} />
          <Route path="/plot-analysis/:novelId" element={<PlotAnalysisLanding />} />
        </Routes>
      </BookContext.Provider>
    </BrowserRouter>
  )
}

export default App
