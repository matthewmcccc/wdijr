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
import newTabIcon from "../assets/img/new-tab.png";
import useContainerSize from "../hooks/useContainerSize";
import TooltipComponent from "../components/Tooltip";
import * as Select from "@radix-ui/react-select";


const CHARACTERS_PER_PAGE = 18;

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
    const setChapterNetworkData = bookContext?.setChapterNetworkData;
    const chapterNetworkData = bookContext?.chapterNetworkData;
    const maxChapter = chapterData.length > 0 ? chapterData.length - 1 : 0;
    const allValue = maxChapter + 1;
    const [sliderValue, setSliderValue] = useState<number>(allValue);
    const selectedChapter = sliderValue === 0 ? null : sliderValue - 1;
    const [cumulative, setCumulative] = useState(true);
    const setCooccurrenceNetworkData = bookContext?.setCooccurrenceNetworkData;
    const { containerRef, width: containerWidth, height: containerHeight } = useContainerSize();
    const [characterPage, setCharacterPage] = useState(0);
    const [networkMode, setNetworkMode] = useState<"conversational" | "cooccurrence">("conversational");

    const characterEntries = characterData ? Object.entries(characterData) : [];
    const totalCharacterPages = Math.ceil(characterEntries.length / CHARACTERS_PER_PAGE);
    const paginatedCharacters = characterEntries.slice(
        characterPage * CHARACTERS_PER_PAGE,
        (characterPage + 1) * CHARACTERS_PER_PAGE
    );

    useEffect(() => {
        setSliderValue(0);
    }, [chapterData.length]);

    useEffect(() => {
        const fetchCharacterData = async () => {
            if (!novelData || novelData.id !== novelId) {
                if (setNovelData && setCharacterData && setNetworkData && setTitle && setAssociatedQuotes && setChapterNetworkData && setCooccurrenceNetworkData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues && setChapterData) {
                    await fetchNovelData(novelId ?? "", setNovelData, setCharacterData, setNetworkData, setTitle, setAssociatedQuotes, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData);
                }
            }
        };
        fetchCharacterData();
    }, [novelId]);

    useEffect(() => {
        if (title) {
            document.title = `Character Analysis | ${title}`;
        }
    }, [title]);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Character Analysis", url: `/character-analysis/${novelId}` }]} />
                <h1 className="text-3xl text-center md:text-left md:text-4xl font-serif">Character Analysis</h1>
                <p className="font-dewi mt-6 text-center md:text-left md:mt-4 text-gray-600 text-sm max-w-3xl">
                    Browse the analysis of {title} characters. Click on a character to see a summary, their closely related
                    characters, and their sentiment arc throughout the novel. The social network graph below shows the relationships between the characters of the novel.
                </p>
            </div>
            <hr className="border-gray-300 my-4 w-full"/>
            <div className="flex flex-col gap-12 mt-4">
                <div className="flex flex-row">
                    <div className="flex flex-col w-full gap-2">
                        <div className="flex flex-col gap-4 w-full border border-gray-300 rounded-lg p-4">
                            <div className="flex items-center justify-center relative">
                                <h1 className="font-serif text-center text-xl mr-1">{title} | </h1>
                                <div className="border border-gray-300 rounded px-2 py-[2px] shadow-sm">
                                    <Select.Root value={networkMode} onValueChange={setNetworkMode}>
                                        <Select.Trigger asChild>
                                            <div className="flex items-center gap-2 cursor-pointer">
                                                <h1 className="font-serif text-center text-black text-lg cursor-pointer">
                                                    <Select.Value />
                                                </h1>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                                            </div>
                                        </Select.Trigger>
                                        <Select.Portal>
                                            <Select.Content position="popper" side="bottom" sideOffset={8} className="border border-gray-300 text-black bg-white p-1 rounded z-50 min-w-[280px]">
                                                <Select.Viewport>
                                                    <Select.Item value="conversational" className="px-3 py-2 cursor-pointer outline-none hover:bg-gray-100 rounded">
                                                        <Select.ItemText>Conversational Network</Select.ItemText>
                                                        <p className="text-xs text-gray-400 mt-0.5">Edges based on dialogue exchanges between characters.</p>
                                                    </Select.Item>
                                                    <Select.Item value="cooccurrence" className="px-3 py-2 cursor-pointer outline-none hover:bg-gray-100 rounded">
                                                        <Select.ItemText>Co-occurrence Network</Select.ItemText>
                                                        <p className="text-xs text-gray-400 mt-0.5">Edges based on characters appearing in the same passages.</p>
                                                    </Select.Item>
                                                </Select.Viewport>
                                            </Select.Content>
                                        </Select.Portal>
                                    </Select.Root>
                                </div>
                                <div className="absolute right-2">
                                    <TooltipComponent title={networkMode === "conversational" ? "Conversational Network" : "Co-occurrence Network"} content={networkMode === "conversational" ? `Each node represents a character, and edges represent interactions between characters. \n\n The width of the edge represents the frequency of interactions.\n\n An interaction is defined as two back and forth quotes between two characters within a certain window of text.` : `Each node represents a character, and edges represent co-occurrences of characters in the same window of text. \n\n The width of an edge represents the frequency of co-occurrences.\n\n A co-occurrence is defined as two characters appearing in the same passage.`} />
                                </div>
                            </div>
                            <hr className="border-gray-300 w-1/2 mx-auto" />
                            <div ref={containerRef} className="w-full h-[400px]">
                                {containerWidth > 0 && containerHeight > 0 && (
                                    <NetworkGraph
                                        key={`${novelId}-${selectedChapter}-${networkMode}`}
                                        id="network-graph-1" 
                                        height={containerHeight}
                                        width={containerWidth}
                                        selectedChapter={selectedChapter}
                                        chapterNetworkData={chapterNetworkData}
                                        onNodeHover={(node) => {
                                            const key = Object.keys(characterData).find(
                                                k => characterData[k].name?.toLowerCase() === node.id
                                            );
                                            setShowSideCard(key || null);
                                        }}
                                        cumulative={cumulative}
                                        networkMode={networkMode}
                                    />                                )}
                            </div>
                            {networkMode == "conversational" && (
                                <div className="flex flex-col items-center w-full mt-2">
                                    <hr className="border-gray-300 w-1/2 mx-auto mb-2" />
                                    <div className="flex items-center gap-1 self-end">
                                        <input type="checkbox" id="cumulative" checked={cumulative} onChange={() => setCumulative(!cumulative)} className="accent-[#228B22] mb-2" />
                                        <label htmlFor="cumulative" className="text-sm text-gray-500 font-dewi mb-2">Cumulative</label>
                                    </div>
                                    <span className="text-sm text-black font-dewi mb-4 border border-gray-500 px-4 py-1 rounded-md">
                                        {selectedChapter === null 
                                            ? "Showing full network" 
                                            : 
                                            <div className="flex items-center gap-1 cursor-pointer" onClick={() => window.open(`/${novelId}/chapter/${selectedChapter}`, "_blank")}>
                                                {chapterData[selectedChapter]?.title || `Chapter ${selectedChapter + 1}`}
                                                <img src={newTabIcon} className="ml-1 w-4 h-4" />
                                            </div>
                                        }
                                    </span>
                                    <div className="flex items-center gap-3 w-3/4">
                                        <button 
                                            onClick={() => setSliderValue(Math.max(0, sliderValue - 1))}
                                            className="text-gray-500 hover:text-black text-lg font-bold px-2 cursor-pointer"
                                        >
                                            ‹
                                        </button>
                                        <input 
                                            type="range" 
                                            min={0} 
                                            max={allValue} 
                                            step={1} 
                                            value={sliderValue}
                                            onChange={(e) => setSliderValue(Number(e.target.value))}
                                            className="accent-[#228B22] flex-1" 
                                        />
                                        <button 
                                            onClick={() => setSliderValue(Math.min(allValue, sliderValue + 1))}
                                            className="text-gray-500 hover:text-black text-lg font-bold px-2 cursor-pointer"
                                        >
                                            ›
                                        </button>
                                    </div>
                                    <div className="flex justify-between w-3/4 mt-1">
                                        <span className="text-xs text-gray-400">All</span>
                                        <span className="text-xs text-gray-400">
                                            {selectedChapter === null ? "" : `Chapter ${selectedChapter + 1} of ${chapterData.length}`}
                                        </span>
                                        <span className="text-xs text-gray-400">{chapterData.length}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>   
                </div>
            </div>
            <div className="py-18">
                <div className="justify-between flex flex-row">
                    <h1 className="font-serif text-4xl">Characters</h1>
                    <Dropdown />
                </div>
                <hr className="border-gray-300 my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    paginatedCharacters.map(([id, data]) => (
                        <Fragment key={id}>
                            {(!data.name) ? "" : null}
                            <CharacterCard 
                                name={humanize(data.name)}
                                image_url={data.image_url ? `${import.meta.env.VITE_API_URL.replace('/api', '/data')}/${novelId}/${data.image_url}` : undefined}
                                // image_url={data.image_url ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${data.image_url}` : defaultAvatar}
                                description={data.description ?? "No description available."}
                                // size={"large"}
                            />
                        </Fragment>
                    ))
                }
                </div>
                {totalCharacterPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button
                            onClick={() => setCharacterPage(p => Math.max(0, p - 1))}
                            disabled={characterPage === 0}
                            className="px-3 py-1 border rounded disabled:opacity-30 cursor-pointer"
                        >
                            ‹ Prev
                        </button>
                        <span className="text-sm text-gray-500 font-dewi">
                            {characterPage + 1} of {totalCharacterPages}
                        </span>
                        <button
                            onClick={() => setCharacterPage(p => Math.min(totalCharacterPages - 1, p + 1))}
                            disabled={characterPage === totalCharacterPages - 1}
                            className="px-3 py-1 border rounded disabled:opacity-30 cursor-pointer"
                        >
                            Next ›
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CharacterAnalysisLanding;