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
import TheatreMask from "../assets/img/drama_mask.png"
import BookIcon from "../assets/img/book_icon.png"
import Puzzle from "../assets/img/puzzle.png"

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
    const setCooccurrenceNetworkData = bookContext?.setCooccurrenceNetworkData;

    useEffect(() => {   
        const fetchData = async () => {
            if (novelId && setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues && setChapterData && setChapterNetworkData && setCooccurrenceNetworkData) {
                await fetchNovelData(novelId, setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData);
            }
        };
        fetchData();
    }, [novelId, setCharacterData, setTitle, setNetworkData, setQuoteData, setSentimentValues, setInflectionPoints, setPlotSummaries, setCoverUrl, setNovelData, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData]);

    useEffect(() => {
        if (title) {
            document.title = `Analysis Overview | ${title}`;
        }
    }, [title]);

    const author = novelData?.author || "Unknown Author";
    const novelDescription = novelData?.description || "No description available.";

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
            <Navbar />
            <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
                <div className="flex flex-col gap-10 w-full">
                    <BookCard 
                        title={title}
                        author={author} 
                        coverUrl={coverUrl || ""} 
                        description={novelDescription.replace(/\*/g, "") || "No description available."}
                    />
                    <hr className="border-gray-300" />
                    <div>
                        <h1 className="text-3xl font-serif mb-8 text-center lg:text-left">Analyses</h1>
                        <div className="flex flex-col lg:flex-row gap-12 mb-20">
                            <AnalysisItem 
                                analysis_type="Characters" 
                                img={TheatreMask} 
                                url={`/character-analysis/${novelId}`} 
                                description="View a list of characters and their details, as well as interactive
                                visualisations."
                            />
                            <AnalysisItem 
                                analysis_type="Plot" 
                                img={BookIcon} 
                                url={`/plot-analysis/${novelId}`} 
                                description="View a detailed analysis of the plot, including key events and their impact on the story."
                            />
                            <AnalysisItem 
                                analysis_type="Miscellany" 
                                img={Puzzle} 
                                url={`/miscellany/${novelId}`} 
                                description="View a collection of miscellaneous analyses, including character interactions, thematic elements, and other insights."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalysisLanding;