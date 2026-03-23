import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import buildNavigationDictionary from "./utils/buildNavigationDictionary";
import NetworkGraph from "./components/NetworkGraph"
import Home from "./pages/Home"
import GraphTest from "./components/GraphTest"
import AnalysisLanding from "./pages/AnalysisLanding"
import CharacterAnalysisLanding from "./pages/CharacterAnalysisOverview"
import CharacterAnalysisProfile from "./pages/CharacterAnalysisProfile";
import { useState, useMemo } from "react";
import { BookContext } from "./contexts/bookContext";
import PlotAnalysisLanding from "./pages/PlotAnalysisOverview";
import Processing from "./pages/Processing";
import ChapterAnalysis from "./pages/ChapterAnalysis";
import Miscellany from "./pages/Miscellany";
import Author from "./pages/Author";
import ThemesAndMotifs from "./pages/ThemesAndMotifs";

const App = () => {
  const [characterData, setCharacterData] = useState<Array<{ id: Number, name: string, summary: string, description: string, novel_id: string, image_url: string }>>([])
  const [networkData, setNetworkData] = useState<{ links: any[], nodes: any[] }>({ links: [], nodes: [] })
  const [novelData, setNovelData] = useState<{ author: string; id: string; title: string } | null>(null);
  const [associatedQuotes, setAssociatedQuotes] = useState<Record<string, { quote: string, sentiment: number }[]> | undefined>(undefined);
  const [topCharacterRelationships, setTopCharacterRelationships] = useState<Record<string, [string, number][]>>();
  const [title, setTitle] = useState("");
  const [topCharacterQuotes, setTopCharacterQuotes] = useState<Record<string, any>>();
  const [attributedQuotes, setAttributedQuotes] = useState<any[]>([]);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [sentimentValues, setSentimentValues] = useState<any>(null);
  const [inflectionPoints, setInflectionPoints] = useState<any>(null);
  const [plotSummaries, setPlotSummaries] = useState<any>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [characterSentimentValues, setCharacterSentimentValues] = useState<any>(null);
  const [chapterData, setChapterData] = useState<Array<{ chapter_number: number; title: string; summary: string; overview: string; novel_id: string }> | null>(null);
  const [chapterNetworkData, setChapterNetworkData] = useState<{ links: any[], nodes: any[] }>({ links: [], nodes: [] });
  const [chapterLengths, setChapterLengths] = useState<number[] | null>(null);
  const [cooccurrenceNetworkData, setCooccurrenceNetworkData] = useState<Array<{ source: string; target: string; value: number }>>([]);
  const [authorData, setAuthorData] = useState<any>(null);
  const [motifData, setMotifData] = useState<Array<{ name: string; description: string }>>([]);
  const contextValue = useMemo(() => ({
      characterData,
      setCharacterData,
      networkData,
      setNetworkData,
      sentimentValues,
      setSentimentValues,
      inflectionPoints,
      setInflectionPoints,
      title,
      setTitle,
      novelData: novelData ?? { author: "", id: "", title: "" },
      setNovelData,
      characterNavigationDict: buildNavigationDictionary(Object.keys(topCharacterRelationships ?? {})),
      associatedQuotes: associatedQuotes ?? {},
      setAssociatedQuotes,
      topCharacterRelationships: topCharacterRelationships ?? {},
      topCharacterQuotes: topCharacterQuotes ?? {},
      attributedQuotes: attributedQuotes ?? [],
      setTopCharacterRelationships,
      quoteData,
      setQuoteData,
      plotSummaries,
      setPlotSummaries,
      coverUrl,
      setCoverUrl,
      characterSentimentValues,
      setCharacterSentimentValues,
      chapterData,
      setChapterData,
      chapterNetworkData,
      setChapterNetworkData,
      chapterLengths,
      setChapterLengths,
      cooccurrenceNetworkData,
      setCooccurrenceNetworkData,
      authorData,
      setAuthorData,
      motifData,
      setMotifData,
  }), [characterData, networkData, novelData, associatedQuotes, topCharacterRelationships, title, topCharacterQuotes, attributedQuotes, quoteData, sentimentValues, inflectionPoints, plotSummaries, coverUrl, characterSentimentValues, chapterData, chapterNetworkData, chapterLengths, cooccurrenceNetworkData, authorData, setCharacterData, setNetworkData, setNovelData, setAssociatedQuotes, setTopCharacterRelationships, setTitle, setTopCharacterQuotes, setAttributedQuotes, setQuoteData, setSentimentValues, setInflectionPoints, setPlotSummaries, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setChapterLengths, setCooccurrenceNetworkData, setAuthorData, setMotifData]);

  return (
    <BrowserRouter>
      <BookContext.Provider value={contextValue}>
        <Routes>
          <Route path="/network-graph" element={<NetworkGraph />} />
          <Route path="/processing/:taskid" element={<Processing />} />
          <Route path="/analysis/:novelId" element={<AnalysisLanding />} />
          <Route path="/character-analysis/:novelId" element={<CharacterAnalysisLanding />} />
          <Route path="/character/:novelId/:name" element={<CharacterAnalysisProfile />} />
          <Route path="/" element={<Home />} />
          <Route path="/graph-test" element={<GraphTest />} />
          <Route path="/plot-analysis/:novelId" element={<PlotAnalysisLanding />} />
          <Route path="/:novelId/chapter/:chapterNumber" element={<ChapterAnalysis />} />
          <Route path="/miscellany/:novelId" element={<Miscellany />} />
          <Route path="/author/:novelId" element={<Author />} />
          <Route path="/themes-and-motifs/:novelId" element={<ThemesAndMotifs />} />
        </Routes>
      </BookContext.Provider>
    </BrowserRouter>
  )
}

export default App
