import React, { useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import { BookContext } from "../contexts/bookContext";
import { useParams } from "react-router";
import fetchNovelData from "../utils/fetchNovelData";
import Breadcrumbs from "../components/Breadcrumbs";
import CharacterCard from "../components/CharacterCard";
import humanize from "../utils/humanize";
import RelatedCharacterCard from "../components/RelatedCharacterCard";
import PlotEventCard from "../components/PlotEventCard";
import ChapterPageEventCard from "../components/ChapterPageEventCard";
import ChapterNavigation from "../components/ChapterNavigation";
import SentimentAreaChart from "../components/SentimentAreaChart";
import NetworkGraph from "../components/NetworkGraph";


const ChapterAnalysis = () => {
    const allChapterData = useContext(BookContext)?.chapterData;
    const chapterNumber = useParams().chapterNumber;
    const chapterData = allChapterData?.find(chapter => chapter.chapter_number == parseInt(chapterNumber));
    const setNovelData = useContext(BookContext)?.setNovelData;
    const setCharacterData = useContext(BookContext)?.setCharacterData;
    const setNetworkData = useContext(BookContext)?.setNetworkData;
    const setTitle = useContext(BookContext)?.setTitle;
    const setQuoteData = useContext(BookContext)?.setQuoteData;
    const setPlotSummaries = useContext(BookContext)?.setPlotSummaries;
    const setSentimentValues = useContext(BookContext)?.setSentimentValues;
    const setInflectionPoints = useContext(BookContext)?.setInflectionPoints;
    const setCoverUrl = useContext(BookContext)?.setCoverUrl;
    const setCharacterSentimentValues = useContext(BookContext)?.setCharacterSentimentValues;
    const setChapterData = useContext(BookContext)?.setChapterData;
    const setChapterNetworkData = useContext(BookContext)?.setChapterNetworkData;
    const chapterNetworkData = useContext(BookContext)?.chapterNetworkData;
    const novelId = useParams<{ novelId: string }>().novelId;
    const quoteData = useContext(BookContext)?.quoteData;
    const characterData = useContext(BookContext)?.characterData;
    const plotSummaries = useContext(BookContext)?.plotSummaries;

    useEffect(() => {
        const fetchData = async () => {
            if (setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues && setChapterData && setChapterNetworkData) {
                await fetchNovelData(novelId ?? "", setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData);
            }
        };
        fetchData();
    }, [novelId, !plotSummaries]);

    useEffect(() => {
        if (chapterData) {
            document.title = `${chapterData.title} | Chapter Analysis`;
        }
    })

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [chapterNumber]);

    const keyCharacters = quoteData
        ?.filter(quote => quote.chapter_number === parseInt(chapterNumber))
        .reduce((acc, quote) => {
            acc[quote.speaker] = (acc[quote.speaker] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    const topCharacters = Object.entries(keyCharacters ?? {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name]) => name);

    const characterImages = characterData?.filter(character => topCharacters.includes(character.name))
        .reduce((acc, character) => {
            acc[character.name] = character.image_url;
            return acc;
        }, {} as Record<string, string>);


    const keyEvents = plotSummaries
        ?.filter(item => item[1] === parseInt(chapterNumber))
        .map(item => item[0]);
    const leftChapter = chapterData && chapterNumber && parseInt(chapterNumber) !== 0  ? allChapterData?.find(chapter => chapter.chapter_number === chapterData.chapter_number - 1) : null;
    const rightChapter = chapterData && chapterNumber ? allChapterData?.find(chapter => chapter.chapter_number === chapterData.chapter_number + 1) : null;

    if (!chapterData) {
        return (
            <div>
                <Navbar />
                Loading...
            </div>
        )
    }

    const chapterSentimentData = (chapterData.sentiment || []).map((val, i, arr) => ({
        x: arr.length > 1 ? i / (arr.length - 1) : 0,
        sentiment: val,
    }));

    const chapterHasNetworkData = chapterNetworkData && chapterNetworkData.nodes && chapterNetworkData.nodes.length > 0;
    const chapterHasSentimentData = chapterSentimentData && chapterSentimentData.length > 0;

    console.log(characterImages);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, {label: "Plot Analysis", url: `/plot-analysis/${novelId}`}, { label: "Chapter Analysis" }]} />
                <div>
                    <div className="font-serif text-center justify-between flex flex-row items-center">
                        <div className="flex-1 flex justify-start absolute left-0">
                            {leftChapter ? <ChapterNavigation id={(parseInt(chapterNumber) - 1).toString()} name={leftChapter.title} position="left" /> : <div style={{ width: "120px" }} />}
                        </div>
                        <h1 className="text-2xl md:text-4xl font-serif text-center flex-1">
                            {chapterData.title}
                        </h1>
                        <div className="flex-1 flex justify-end absolute right-0">
                            {rightChapter ? <ChapterNavigation id={(parseInt(chapterNumber) + 1).toString()} name={rightChapter.title} position="right" /> : <div style={{ width: "120px" }} />}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row font-dewi text-md mt-6 gap-6">
                        <div className="flex-1 md:flex-3">
                            <h1 className="text-center md:text-left text-3xl font-serif mb-6">
                                Summary
                            </h1>
                            <hr className="border-gray-300 my-6 w-3/4"/>
                            <p className="whitespace-pre-wrap text-center md:text-left w-3/4">
                                {chapterData.summary}
                            </p>
                        </div>
                        <div className="flex-3 md:flex-1">
                            <div className="border border-gray-300 rounded-lg p-4 w-full h-fit shadow-md">
                                <h1 className="text-xl font-serif mb-4 text-center mt-4 md:mt-0 md:text-center">
                                    Key Characters
                                </h1>
                                <hr className="border-gray-300 my-4 w-full"/>
                                <ul className="list-disc list-inside">
                                    {topCharacters.map(character => (
                                        <RelatedCharacterCard 
                                            name={humanize(character)}
                                            // image_url={`${import.meta.env.VITE_API_URL.replace('/api', '/data')}/${novelId}/${characterImages[character] ?? ""}`}
                                            description=""
                                        />
                                    ))}
                                </ul>
                            </div>
                                {keyEvents && keyEvents.length > 0 && (
                                    <div className="border border-gray-300 rounded-lg p-4 mt-6 shadow-md">
                                        <h1 className="text-center md:text-center text-xl font-serif mb-2">
                                            Key Events
                                        </h1>
                                        <hr className="border-gray-300 my-4 w-full"/>
                                        <div className="flex flex-col items-center md:flex-row gap-6">
                                            {keyEvents?.map((event, idx) => {
                                                event = JSON.parse(event);
                                                return (
                                                    <ChapterPageEventCard
                                                        key={idx}
                                                        title={event.headline}
                                                        eventType={event.category}
                                                        description={event.summary}
                                                        characters={event.characters}
                                                        characterData={characterData ?? []}
                                                        onChapterPage={true}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
            <hr className="border-gray-300 my-12 w-full"/>
                <div className="flex flex-col md:flex-row gap-6 justify-between">
                    {chapterHasSentimentData && (
                        <div className="">
                            <div className="border border-gray-300 rounded-lg p-4 w-fit shadow-md">
                                <h1 className="text-lg font-serif mb-4 text-center">Chapter Sentiment</h1>
                                <hr className="border-gray-300 my-4 w-1/2 mx-auto"/>
                                <SentimentAreaChart
                                    data={chapterSentimentData}
                                    width={550}
                                    height={250}
                                    onChapterPage={true}
                                />
                            </div>
                        </div>
                    )}
                    {chapterHasNetworkData && (
                        <div className="border border-gray-300 rounded-lg p-4 w-fit shadow-md">
                            <h1 className="text-lg font-serif mb-4 text-center">Chapter Network</h1>
                            <hr className="border-gray-300 my-4 w-1/2 mx-auto"/>
                            <NetworkGraph
                                key={`chapter-network-${chapterNumber}`}
                                    id={`chapter-network-${chapterNumber}`}
                                height={250}
                                width={550}
                                selectedChapter={parseInt(chapterNumber)}
                                chapterNetworkData={chapterNetworkData}
                                cumulative={false}
                            showLegend={false}
                            />
                        </div>
                    )}
                </div>
            </div>
    )   
}

export default ChapterAnalysis;