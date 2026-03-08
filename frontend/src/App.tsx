import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import buildNavigationDictionary from "./utils/buildNavigationDictionary";
import NetworkGraph from "./components/NetworkGraph"
import Home from "./pages/Home"
import GraphTest from "./components/GraphTest"
import AnalysisLanding from "./pages/AnalysisLanding"
import CharacterAnalysisLanding from "./pages/CharacterAnalysisOverview"
import CharacterAnalysisProfile from "./pages/CharacterAnalysisProfile";
import { createContext, useState } from "react";
import { BookContext } from "./contexts/bookContext";
import * as quotesData from "../data/quotes.json"
import * as summaryData from "../data/summaries.json"
import { text } from "d3";
import PlotAnalysisLanding from "./pages/PlotAnalysisOverview";
import Processing from "./pages/Processing";

const topCharacterRelationships: Record<string, [string, number][]> = 
  {'heathcliff': [['joseph', 19], ['isabella linton', 17], ['catherine earnshaw', 14]], 'joseph': [['heathcliff', 19], ['catherine earnshaw', 13], ['nelly', 11]], 'hareton': [['joseph', 5], ['nelly', 3], ['heathcliff', 3]], 'jabez': [['zillah', 1], ['lockwood', 1]], 'ellen dean': [['catherine', 18], ['linton', 7], ['cathy', 6]], 'catherine earnshaw': [['linton', 18], ['catherine', 15], ['isabella linton', 14]], 'miss': [['catherine', 6], ['joseph', 3], ['nelly', 2]], 'hindley': [['catherine earnshaw', 3], ['joseph', 2], ['isabella linton', 1]], 'nelly': [['joseph', 11], ['heathcliff', 5], ['catherine', 4]], 'isabella': [['isabella linton', 6], ['catherine earnshaw', 3], ['linton', 2]], 'isabella linton': [['heathcliff', 17], ['catherine earnshaw', 14], ['linton', 14]], 'catherine': [['ellen dean', 18], ['catherine earnshaw', 15], ['heathcliff', 10]], 'linton': [['catherine earnshaw', 18], ['isabella linton', 14], ['heathcliff', 10]], 'dean': [['cathy', 2], ['frances', 1]], 'cathy': [['catherine earnshaw', 9], ['isabella linton', 9], ['linton', 6]], 'edgar': [['isabella linton', 9], ['heathcliff', 8], ['catherine', 7]], 'ellen': [['isabella linton', 5], ['catherine earnshaw', 5], ['joseph', 2]], 'kenneth': [['catherine earnshaw', 2], ['isabella linton', 1], ['heathcliff', 1]], 'papa': [['catherine', 2], ['cathy', 2], ['isabella linton', 1]], 'zillah': [['linton', 2], ['edgar', 2], ['heathcliff', 1]], 'green': [['linton', 1], ['joseph', 1]], 'lockwood': [['nelly', 2], ['joseph', 1], ['jabez', 1]]}

const topCharacterQuotes: Record<string, { quote: string, sentiment: number }[]> =
  {'heathcliff': [{'quote': 'And grief and disappointment are hastening his death. Nelly, if you won’t let her go, you can walk over yourself. But I shall not return till this time next week; and I think your master himself would scarcely object to her visiting her cousin.', 'sentiment': -0.6908}], 'joseph': [{'quote': 'My cousin fancies you are an idiot. There you experience the consequence of scorning ‘book-larning,’ as you would say. Have you noticed, Catherine, his frightful Yorkshire pronunciation?', 'sentiment': -0.765}], 'hareton': [{'quote': 'Where is the use of the devil in that sentence?', 'sentiment': -0.6249}], 'jabez': [{'quote': 'you may go into my room: you’ll only be in the way, coming downstairs so early: and your childish outcry has sent sleep to the devil for me.', 'sentiment': -0.872}], 'ellen dean': [{'quote': 'Ellen! Ellen! come upstairs—I’m sick!', 'sentiment': -0.6341}], 'catherine earnshaw': [{'quote': 'For shame! for shame!', 'sentiment': -0.7772}], 'miss': [{'quote': 'And at the end of it to be flighted to death!', 'sentiment': -0.636}], 'hindley': [], 'nelly': [{'quote': 'since she repents of her sauciness. It would do you a great deal of good: it would make you another man to have her for a companion.', 'sentiment': 0.7906}], 'isabella': [{'quote': 'but she must mind and not grow wild again here. Ellen, help Miss Catherine off with her things—Stay, dear, you will disarrange your curls—let me untie your hat.', 'sentiment': 0.7227}], 'isabella linton': [{'quote': 'I’d thank you to adhere to the truth and not slander me, even in joke! Mr. Heathcliff, be kind enough to bid this friend of yours release me: she forgets that you and I are not intimate acquaintances; and what amuses her is painful to me beyond expression.', 'sentiment': 0.9223}], 'catherine': [{'quote': 'You love Mr. Edgar because he is handsome, and young, and cheerful, and rich, and loves you. The last, however, goes for nothing: you would love him without that, probably; and with it you wouldn’t, unless he possessed the four former attractions.', 'sentiment': 0.9561}], 'linton': [{'quote': 'what are they? For heaven’s sake, Catherine, don’t look so angry! Despise me as much as you please; I am a worthless, cowardly wretch: I can’t be scorned enough; but I’m too mean for your anger. Hate my father, and spare me for contempt.', 'sentiment': -0.9724}], 'dean': [], 'cathy': [{'quote': 'Now, darling,', 'sentiment': 0.5859}], 'edgar': [{'quote': 'but he has black hair and eyes, and looks sterner; and he is taller and bigger altogether. He’ll not seem to you so gentle and kind at first, perhaps, because it is not his way: still, mind you, be frank and cordial with him; and naturally he’ll be fonder of you than any uncle, for you are his own.', 'sentiment': 0.9023}], 'ellen': [{'quote': 'Yes, that’s all the good that such a brute as you can get from them!', 'sentiment': 0.7088}], 'kenneth': [{'quote': 'Sorry? he’ll break his heart should anything happen!', 'sentiment': 0.636}], 'papa': [], 'zillah': [], 'green': [], 'lockwood': []}

const attributedQuotes = (quotesData as any).default ?? quotesData


const App = () => {
  const [characterData, setCharacterData] = useState<Array<{ id: Number, name: string, summary: string, description: string, novel_id: number }>>([])
  const [networkData, setNetworkData] = useState<{ links: any[], nodes: any[] }>({ links: [], nodes: [] })
  const [novelData, setNovelData] = useState<{ author: string; id: string; title: string } | null>(null);
  const [title, setTitle] = useState("");

  return (
    <BrowserRouter>
      <BookContext.Provider value={{
          characterData: characterData,
          setCharacterData: setCharacterData,
          networkData: networkData,
          setNetworkData: setNetworkData,
          title: title,
          setTitle: setTitle,
          novelData: novelData ?? { author: "", id: "", title: "" },
          setNovelData: setNovelData,
          characterNavigationDict: buildNavigationDictionary(Object.keys(topCharacterRelationships)),
          topCharacterRelationships: topCharacterRelationships,
          topCharacterQuotes: topCharacterQuotes,
          attributedQuotes: attributedQuotes,
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
