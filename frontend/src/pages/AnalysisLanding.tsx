import { useContext, useEffect, useState } from "react";
import { data, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnalysisItem from "../components/AnalysisItem";
import GraphImage from "../assets/img/chart.png"
import getAllNovelData from "../utils/getAllNovelData";
import { BookContext } from "../contexts/bookContext";
import fetchNovelData from "../utils/fetchNovelData";
import BookCard from "../components/BookCard";
import Breadcrumbs from "../components/Breadcrumbs";

interface AnalysisProps {
    text_title: string
}

const AnalysisLanding = () => {
    const title = useContext(BookContext)?.title || "";
    const setTitle = useContext(BookContext)?.setTitle;
    const { novelId } = useParams<{ novelId: string }>();
    const bookContext = useContext(BookContext);
    const setCharacterData = bookContext?.setCharacterData;
    const setNetworkData = bookContext?.setNetworkData;
    const setQuoteData = bookContext?.setQuoteData;  
    const setSentimentValues = bookContext?.setSentimentValues;
    const setInflectionPoints = bookContext?.setInflectionPoints;
    const setPlotSummaries = bookContext?.setPlotSummaries;
    const setCoverUrl = bookContext?.setCoverUrl;
    const setNovelData = bookContext?.setNovelData;
    const setCharacterSentimentValues = bookContext?.setCharacterSentimentValues;
    const setChapterData = bookContext?.setChapterData;
    const coverUrl = bookContext?.coverUrl;
    const novelData = bookContext?.novelData;
    const setChapterNetworkData = bookContext?.setChapterNetworkData;
    const chapterNetworkData = bookContext?.chapterNetworkData;

    useEffect(() => {   
        const fetchData = async () => {
            if (novelId && setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues && setChapterData && setChapterNetworkData) {
                await fetchNovelData(novelId, setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData);
            }
        };
        fetchData();
    }, [novelId, setCharacterData, setTitle, setNetworkData, setQuoteData, setSentimentValues, setInflectionPoints, setPlotSummaries, setCoverUrl, setNovelData, setCharacterSentimentValues, setChapterData, setChapterNetworkData]);

    const author = novelData?.author || "Unknown Author";

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
                {/* <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }]} /> */}
                <div className="mt-12 flex flex-col gap-14 justify-center">
                    <BookCard 
                        title={title}
                        author={author} 
                        coverUrl={coverUrl || ""} 
                        description="Alice's Adventures in Wonderland (1865) is a novel by Lewis Carroll, the pen name of Oxford mathematician Charles Lutwidge Dodgson. It follows young Alice as she falls down a rabbit hole into a fantastical underground world populated by eccentric characters — the Cheshire Cat, the Mad Hatter, the Queen of Hearts — and navigates a series of absurd encounters that play with logic, language, and the conventions of Victorian society. Originally written to entertain Alice Liddell, the daughter of a colleague, the book became one of the most influential works of literary nonsense and remains widely read across all ages."
                    />
                    <hr className="border-gray-300" />
                    <div className="flex flex-row gap-12 mb-20">
                        <AnalysisItem 
                            analysis_type="Characters" 
                            img={GraphImage} 
                            url={`/character-analysis/${novelId}`} 
                            description="View a list of characters and their details, as well as interactive
                            visualisations."
                        />
                        <AnalysisItem 
                            analysis_type="Plot" 
                            img={GraphImage} 
                            url={`/plot-analysis/${novelId}`} 
                            description="View a detailed analysis of the plot, including key events and their impact on the story."
                        />
                        <AnalysisItem 
                            analysis_type="Miscellany" 
                            img={GraphImage} 
                            url={`/miscellany-analysis/${novelId}`} 
                            description="View a collection of miscellaneous analyses, including character interactions, thematic elements, and other insights."
                        />
                    </div>
                </div>
        </div>
    )
}

export default AnalysisLanding;