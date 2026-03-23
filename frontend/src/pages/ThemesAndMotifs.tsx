import { useContext, useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import Navbar from "../components/Navbar";
import fetchNovelData from "../utils/fetchNovelData";
import { BookContext } from "../contexts/bookContext";
import { useParams } from "react-router-dom";
import MotifAccordion from "../components/MotifAccordion";
import MotifTreeGraph from "../components/MotifTreeGraph";

const ThemesAndMotifs = () => {
    const title = "Themes and Motifs";
    const bookContext = useContext(BookContext);
    const { novelId } = useParams<{ novelId: string }>();
    const setNovelData = bookContext?.setNovelData;
    const setCharacterData = bookContext?.setCharacterData;
    const setNetworkData = bookContext?.setNetworkData;
    const setTitle = bookContext?.setTitle;
    const setQuoteData = bookContext?.setQuoteData;
    const setPlotSummaries = bookContext?.setPlotSummaries;
    const setSentimentValues = bookContext?.setSentimentValues;
    const setInflectionPoints = bookContext?.setInflectionPoints;
    const setCoverUrl = bookContext?.setCoverUrl;
    const setCharacterSentimentValues = bookContext?.setCharacterSentimentValues;
    const setChapterData = bookContext?.setChapterData;
    const setChapterNetworkData = bookContext?.setChapterNetworkData;
    const setCooccurrenceNetworkData = bookContext?.setCooccurrenceNetworkData;
    const setAuthorData = bookContext?.setAuthorData;
    const setMotifData = bookContext?.setMotifData;
    const bookTitle = bookContext?.title;
    const motifData = bookContext?.motifData;

    useEffect(() => {
        const fetchData = async () => {
            if (novelId && setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues && setChapterData && setChapterNetworkData && setCooccurrenceNetworkData && setAuthorData && setMotifData ) {
                await fetchNovelData(novelId, setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData, setAuthorData, setMotifData);
            }
        };
        fetchData();
    }, [novelId, setCharacterData, setTitle, setNetworkData, setQuoteData, setSentimentValues, setInflectionPoints, setPlotSummaries, setCoverUrl, setNovelData, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData, setAuthorData, setMotifData]);

    useEffect(() => {
        document.title = `${title}`;
    })

    return ( 
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Miscellany", url: `/miscellany/${novelId}` }]} />
                <h1 className="text-5xl font-serif mb-4">Themes and Motifs</h1>
                <p className="text-lg mb-4 text-gray-700">Explore the major themes and motifs present in the novel, and how they contribute to the overall narrative.</p>
            </div>
            <hr className="border-gray-300 mb-4" />
            <div className="border border-gray-300 rounded-md mb-8">
                <h1 className="text-xl font-serif my-4 text-center">{bookTitle} | Motif Tree Graph</h1>
                <hr className="w-1/2 mx-auto border-gray-300" />
                <MotifTreeGraph motifData={motifData || {}} />
            </div>
            <div className="col-span-4">
                {motifData ? (
                    <MotifAccordion motifData={motifData} />
                ) : (
                    <p className="text-lg text-gray-700">No motifs available.</p>
                )}
            </div>
        </div>
    )
}

export default ThemesAndMotifs;