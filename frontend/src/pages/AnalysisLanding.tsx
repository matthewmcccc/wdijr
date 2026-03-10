import { useContext, useEffect, useState } from "react";
import { data, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnalysisItem from "../components/AnalysisItem";
import GraphImage from "../assets/img/chart.png"
import getAllNovelData from "../utils/getAllNovelData";
import { BookContext } from "../contexts/bookContext";

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
    const sentimentValues = bookContext?.sentimentValues;
    const inflectionPoints = bookContext?.inflectionPoints;
    const plotSummaries = bookContext?.plotSummaries;

    useEffect(() => {   
        const fetchData = async () => {
            if (novelId) {
                const data = await getAllNovelData(novelId);
                setCharacterData?.(data.characters);
                setTitle?.(data.novel.title);
                setNetworkData?.(data.analysis.network);
                setQuoteData?.(data.quotes);
                setSentimentValues?.(data.analysis.sentiment_values);
                setInflectionPoints?.(data.analysis.inflection_points);
                setPlotSummaries?.(data.analysis.plot_summaries);
            }
        };

        fetchData();
    }, [novelId, setCharacterData, setTitle, setNetworkData, setQuoteData, setSentimentValues, setInflectionPoints, setPlotSummaries]);

    console.log(plotSummaries)

    return (
        <div className="">
            <Navbar />
                <div className="mt-20">
                    <div className="font-serif text-5xl text-center underline">
                        {title}
                    </div>
                    <div className="flex flex-row gap-12 mt-20 ml-80">
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