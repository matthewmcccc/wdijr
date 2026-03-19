import { Fragment, useContext, useEffect, useState } from "react";
import NetworkGraph from "../components/NetworkGraph";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import Dropdown from "../components/Dropdown";
import CharacterCard from "../components/CharacterCard";
import { BookContext } from "../contexts/bookContext";
import humanize from "../utils/humanize";
import { useParams } from "react-router-dom";
import fetchNovelData from "../utils/fetchNovelData";
import SideCharacterCard from "../components/SideCharacterCard";
import newTabIcon from "../assets/img/new-tab.png";
import defaultAvatar from "../assets/img/default-avatar.png";

const CharacterAnalysisLanding = () => {
    const characterData = useContext(BookContext)?.characterData;
    const title = useContext(BookContext)?.title || "";
    const setTitle = useContext(BookContext)?.setTitle;
    const novelId = useParams<{ novelId: string }>().novelId;
    const bookContext = useContext(BookContext);
    const novelData = bookContext?.novelData;
    const setCharacterData = bookContext?.setCharacterData;
    const setNetworkData = bookContext?.setNetworkData;
    const setNovelData = bookContext?.setNovelData;
    const setAssociatedQuotes = bookContext?.setAssociatedQuotes;
    const setPlotSummaries = bookContext?.setPlotSummaries;
    const setSentimentValues = bookContext?.setSentimentValues;
    const setInflectionPoints = bookContext?.setInflectionPoints;
    const setCoverUrl = bookContext?.setCoverUrl;
    const setCharacterSentimentValues = bookContext?.setCharacterSentimentValues;
    const setChapterData = bookContext?.setChapterData;
    const chapterData = bookContext?.chapterData || [];
    const associatedQuotes = bookContext?.associatedQuotes;
    const setChapterNetworkData = bookContext?.setChapterNetworkData;
    const chapterNetworkData = bookContext?.chapterNetworkData;
    const [showSideCard, setShowSideCard] = useState(false);
    const maxChapter = chapterData.length > 0 ? chapterData.length - 1 : 0;
    const allValue = maxChapter + 1;
    const [sliderValue, setSliderValue] = useState<number>(allValue);
    const selectedChapter = sliderValue === 0 ? null : sliderValue - 1;
    const [cumulative, setCumulative] = useState(true);

    useEffect(() => {
        setSliderValue(0);
    }, [chapterData.length]);

    useEffect(() => {
        const fetchCharacterData = async () => {
            if (!novelData || novelData.id !== novelId) {
                if (setNovelData && setCharacterData && setNetworkData && setTitle && setAssociatedQuotes && setChapterNetworkData) {
                    await fetchNovelData(novelId ?? "", setNovelData, setCharacterData, setNetworkData, setTitle, setAssociatedQuotes, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData);
                }
            }
        };
        fetchCharacterData();
    }, [novelId]);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Character Analysis", url: `/character-analysis/${novelId}` }]} />
                <h1 className="text-5xl font-serif">Character Analysis</h1>
                <p className="font-dewi mt-4 text-gray-600 text-sm max-w-3xl">
                    Browse the analysis of {title} characters. Click on a character to see a summary, their closely related
                    characters, and their sentiment arc throughout the novel. The social network graph below shows the relationships between the characters of the novel.
                </p>
            </div>
            <hr className="border-gray-300 my-4 w-full"/>
            <div className="flex flex-col gap-12 mt-4">
                <div className="flex flex-row">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-4 w-full border border-gray-300 rounded-lg p-4">
                            <h1 className="font-dewi">Social Network Graph</h1>
                            <div>
                                <NetworkGraph 
                                    key={`${novelId}-${selectedChapter}`}
                                    id="network-graph-1" 
                                    height={400}
                                    width={1250}
                                    selectedChapter={selectedChapter}
                                    chapterNetworkData={chapterNetworkData}
                                    onNodeHover={(node) => {
                                        const key = Object.keys(characterData).find(
                                            k => characterData[k].name?.toLowerCase() === node.id
                                        );
                                        setShowSideCard(key || null);
                                    }}
                                    cumulative={cumulative}
                                />
                                {showSideCard && characterData?.[showSideCard] && (
                                    console.log(characterData[showSideCard]),
                                    <SideCharacterCard
                                        name={characterData[showSideCard].name}
                                        description={characterData[showSideCard].description}
                                        top_relationships={characterData[showSideCard].top_relationships}
                                    />
                                )}
                            </div>
                            <div className="flex flex-col items-center w-full mt-2">
                                <div className="flex items-center gap-1 self-end">
                                    <input type="checkbox" id="cumulative" checked={cumulative} onChange={() => setCumulative(!cumulative)} className="mb-2" />
                                    <label htmlFor="cumulative" className="text-sm text-gray-500 font-dewi mb-2">Cumulative</label>
                                </div>
                                <span className="text-sm text-black font-dewi mb-4 border border-gray-500 px-4 py-1 rounded-md">
                                    {selectedChapter === null 
                                        ? "Showing full network" 
                                        : 
                                        <div className="flex items-center gap-1 cursor-pointer" onClick={() => window.open(`/${novelId}/chapter/${selectedChapter}`, "_blank")}>
                                            {chapterData[selectedChapter]?.title || ""}
                                            <img src={newTabIcon} className="ml-1 w-4 h-4" />
                                        </div>
                                    }
                                </span>
                                <input 
                                    type="range" 
                                    min={0} 
                                    max={allValue} 
                                    step={1} 
                                    value={sliderValue}
                                    onChange={(e) => setSliderValue(Number(e.target.value))}
                                    className="w-3/4" 
                                />
                                <div className="flex justify-between w-3/4 mt-1">
                                <span 
                                        className={`text-xs cursor-pointer ${
                                            selectedChapter === null
                                                ? "text-gray-700 font-medium" 
                                                : "text-gray-400"
                                        }`}
                                        onClick={() => setSliderValue(0)}
                                    >
                                        All
                                    </span>
                                    {chapterData.map((_chapter, index) => (
                                        <span 
                                            key={index} 
                                            className={`text-xs cursor-pointer ${
                                                selectedChapter !== null && index <= selectedChapter
                                                    ? "text-gray-700 font-medium" 
                                                    : "text-gray-400"
                                            }`}
                                            onClick={() => setSliderValue(index + 1)}
                                        >
                                            {index + 1}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>   
                </div>
                <div className="">
                    <div className="justify-between flex flex-row">
                        <h1 className="font-serif text-4xl">Characters</h1>
                        <Dropdown />
                    </div>
                    <hr className="border-gray-300 my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {
                        characterData && Object.entries(characterData).map(([id, data]) => (
                            console.log(`data for ${id}:`, data),
                            <Fragment key={id}>
                                {(!data.name) ? "" : null}
                                <CharacterCard 
                                    name={humanize(data.name)}
                                    // setCoverUrl?.(`${import.meta.env.VITE_API_URL.replace('/api', '')}${data.novel.cover_url}`);
                                    img={data.image_url ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${data.image_url}` : defaultAvatar}
                                    description={data.description ?? "No description available."}
                                    size={"large"}
                                />
                            </Fragment>
                        ))
                    }
                    </div>
                </div>
            </div>
        </div> 
    )
}

export default CharacterAnalysisLanding;