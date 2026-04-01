import { useContext, useEffect } from "react";
import { BookContext } from "../contexts/bookContext";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import { useParams } from "react-router-dom";
import VocabularyBarChart from "../components/VocabBarChart";
import fetchNovelData from "../utils/fetchNovelData";
import humanize from "../utils/humanize";


const Vocabulary = () => {
    const novelId = useParams<{ novelId: string }>().novelId;
    const bookTitle = useContext(BookContext)?.title || "Novel";

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
    const setTopCharacterRelationships = useContext(BookContext)?.setTopCharacterRelationships;
    const lexicalRichness = useContext(BookContext)?.lexicalRichness;
    const setLexicalRichness = useContext(BookContext)?.setLexicalRichness;

    const lexicalRichnessData = Object.entries(lexicalRichness ?? {}).map(([character, confidence]) => ({ character, confidence }));

    useEffect(() => {
        const fetchData = async () => {
            if (setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues && setChapterData && setChapterNetworkData && setLexicalRichness) {
                await fetchNovelData(novelId ?? "", setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData, setTopCharacterRelationships, setMotifData, setLexicalRichness);
            }
        };
        fetchData();
    }, [novelId, !lexicalRichness]);

    useEffect(() => {
        document.title = `Vocabulary Richness | ${bookTitle}`;
    }, [bookTitle]);

    return (
        <div className="mx-auto container px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Vocabulary", url: `/vocabulary/${novelId}` }]} />
                <h1 className="text-5xl font-serif mb-4">Vocabulary Richness</h1>
                <p className="text-md text-gray-700">
                    This page analyzes the richness of the novel's vocabulary, including unique words, lexical diversity, and more.
                </p>
            </div>
            <hr className="my-4 border-gray-300" />
            <div>
                <VocabularyBarChart data={lexicalRichnessData.map((d) => ({ ...d, character: humanize(d.character) }))} />
            </div>
        </div>
    );
}

export default Vocabulary;