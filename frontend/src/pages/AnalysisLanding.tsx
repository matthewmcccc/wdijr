import { useContext, useEffect, useState } from "react";
import { data, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnalysisItem from "../components/AnalysisItem";
import GraphImage from "../assets/img/chart.png"
import getAllNovelData from "../utils/getAllNovelData";
import { BookContext } from "../contexts/bookContext";
import fetchNovelData from "../utils/fetchNovelData";

interface AnalysisProps {
    text_title: string
}

const AnalysisLanding = () => {
    const title = useContext(BookContext)?.title || "";
    const setTitle = useContext(BookContext)?.setTitle;
    const navigate = useNavigate();
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
    const characterSentimentValues = bookContext?.characterSentimentValues;

    useEffect(() => {   
        const fetchData = async () => {
            if (novelId && setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues) {
                await fetchNovelData(novelId, setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues);
            }
        };

        fetchData();
    }, [novelId, setCharacterData, setTitle, setNetworkData, setQuoteData, setSentimentValues, setInflectionPoints, setPlotSummaries, setCoverUrl, setNovelData, setCharacterSentimentValues]);

    console.log("character sentiment Values:", characterSentimentValues);

    return (
        <div className="">
            <Navbar />
                <div className="mt-20 flex flex-col gap-12 justify-center">
                    <div className="font-serif text-3xl text-center underline flex items-center flex-col">
                        {title}
                    </div>
                    <div className="flex flex-row gap-12 justify-center">
                        <AnalysisItem 
                            analysis_type="Character Analysis" 
                            img={GraphImage} 
                            url={`/character-analysis/${novelId}`} 
                            description="View a list of characters and their details, as well as interactive
                            visualisations."
                        />
                        <AnalysisItem 
                            analysis_type="Plot Analysis" 
                            img={GraphImage} 
                            url={`/plot-analysis/${novelId}`} 
                            description="View a detailed analysis of the plot, including key events and their impact on the story."
                        />
                    </div>
                </div>
        </div>
    )
}

export default AnalysisLanding;