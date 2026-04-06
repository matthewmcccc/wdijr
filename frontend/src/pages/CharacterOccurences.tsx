import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import { BookContext } from "../contexts/bookContext";
import { useContext, useEffect } from "react";
import fetchNovelData from "../utils/fetchNovelData";
import CharacterOccurencesHeatmap from "../components/CharacterOccurencesHeatmap";
import TooltipComponent from "../components/Tooltip";

const CharacterOccurences = () => {
    const novelId = useParams<{ novelId: string }>().novelId;
    const characterOccurenceData = useContext(BookContext)?.chapterOccurenceData;
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
    const setCooccurrenceNetworkData = useContext(BookContext)?.setCooccurrenceNetworkData;
    const setAuthorData = useContext(BookContext)?.setAuthorData;
    const setMotifData = useContext(BookContext)?.setMotifData;
    const setLexicalRichness = useContext(BookContext)?.setLexicalRichness;
    const setChapterCooccurrenceData = useContext(BookContext)?.setChapterCooccurrenceData;
    const setChapterOccurenceData = useContext(BookContext)?.setChapterOccurenceData;
    const characterData = useContext(BookContext)?.characterData;
    const chapterData = useContext(BookContext)?.chapterData;
    const chapterOccurenceData = useContext(BookContext)?.chapterOccurenceData;

    useEffect(() => {
        const fetchData = async () => {
            if (novelId && setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues && setChapterData && setChapterNetworkData && setCooccurrenceNetworkData && setAuthorData && setMotifData && setLexicalRichness && setChapterCooccurrenceData && setChapterOccurenceData) {
                await fetchNovelData(novelId, setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData, setAuthorData, setMotifData, setLexicalRichness, setChapterCooccurrenceData, setChapterOccurenceData);
            }
        };
        fetchData();
    }, [novelId])

    const characters = characterData ? characterData.map(c => c.name) : [];
    const chapters = chapterData ? chapterData.map(c => c.title) : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, {label: "Miscellany", url: `/miscellany/${novelId}`}, { label: "Character Occurences" }]} />
                <h1 className="text-5xl font-serif mb-4">Character Occurences</h1>
                <p className="text-md text-gray-700">
                    A collection of additional analyses and insights about the novel that don't fit into the other categories, but are still fascinating to explore.
                </p>
            </div>
            <hr className="border-gray-300 my-4" />
            <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <h1></h1>
                    <h1 className="text-center font-serif text-xl">Character Occurences by Chapter</h1>
                    <TooltipComponent title="Character Occurences by Chapter" content={"This heatmap shows the number of times each character appears in each chapter."}/>
                </div>
                <hr className="border-gray-300 my-4 w-2/3 mx-auto" />
                <CharacterOccurencesHeatmap data={characterOccurenceData} />
            </div>
        </div>
    );        
}

export default CharacterOccurences;