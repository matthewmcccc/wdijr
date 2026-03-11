import React, { useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import { BookContext } from "../contexts/bookContext";
import { useParams } from "react-router";
import fetchNovelData from "../utils/fetchNovelData";
import Breadcrumbs from "../components/Breadcrumbs";
import CharacterCard from "../components/CharacterCard";
import humanize from "../utils/humanize";


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
    const novelId = useParams<{ novelId: string }>().novelId;
    const quoteData = useContext(BookContext)?.quoteData;

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


    useEffect(() => {
        const fetchData = async () => {
            if (setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues && setChapterData) {
                await fetchNovelData(novelId ?? "", setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData);
            }
        };
        fetchData();
    }, [novelId]);

    console.log(`all chapter data: ${JSON.stringify(allChapterData)}`);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, {label: "Plot Analysis", url: `/plot-analysis/${novelId}`}, { label: "Chapter Analysis" }]} />
                <div>
                    <h1 className="text-4xl font-serif text-center">
                        {chapterData.title}
                    </h1>
                    <div className="flex flex-row font-dewi text-md mt-6 gap-70">
                        <div className="flex-3">
                            <h1 className="text-3xl font-serif mb-6">
                                Summary
                            </h1>
                            <hr className="border-gray-300 my-6"/>
                            <p className="whitespace-pre-wrap">
                                {chapterData.summary}
                            </p>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-serif mb-4">
                                Key Characters
                            </h1>
                            <hr className="border-gray-300 my-4"/>
                            <ul className="list-disc list-inside">
                                {topCharacters.map(character => (
                                    <CharacterCard 
                                        name={humanize(character)}
                                        description=""
                                        size="small"
                                    />
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )   
}

export default ChapterAnalysis;