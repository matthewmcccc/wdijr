import { useState, useEffect, useContext, use } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import { BookContext } from "../contexts/bookContext";
import { Navigate, useNavigate } from "react-router";
import Navbar from "../components/Navbar";

const Processing = () => {
    const taskId = useParams().taskid;
    const [done, setDone] = useState(false);
    const [status, setStatus] = useState<string>("Processing...");
    const [novelId, setNovelId] = useState<number | null>(null);
    const setNetworkData = useContext(BookContext)?.setNetworkData;
    const setCharacterData = useContext(BookContext)?.setCharacterData;
    const setTitle = useContext(BookContext)?.setTitle;
    const setAssociatedQuotes = useContext(BookContext)?.setAssociatedQuotes;
    const setTopRelationships = useContext(BookContext)?.setTopCharacterRelationships;
    const associatedQuotes = useContext(BookContext)?.associatedQuotes;
    const setSentimentValues = useContext(BookContext)?.setSentimentValues;
    const setInflectionPoints = useContext(BookContext)?.setInflectionPoints;
    const setPlotSummaries = useContext(BookContext)?.setPlotSummaries;
    const setCoverUrl = useContext(BookContext)?.setCoverUrl;
    const setCharacterSentimentValues = useContext(BookContext)?.setCharacterSentimentValues;
    const navigate = useNavigate();
    const chapterNetworkData = useContext(BookContext)?.chapterNetworkData;
    const setChapterNetworkData = useContext(BookContext)?.setChapterNetworkData;

    useEffect(() => {
        if (done) return;

        const pollInterval = setInterval(async () => {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/analysis/process/${taskId}`)
            setStatus(data.data.detail || "Processing...");
        if (data.data.status == "complete") {
                setTitle?.(data.data.data.title);
                setNetworkData?.(data.data.data.network);
                setSentimentValues?.(data.data.data.sentiment_values);
                setInflectionPoints?.(data.data.data.inflection_points);
                setCharacterData?.(data.data.data.characters);
                setNovelId(data.data.data.novel_id);
                setAssociatedQuotes?.(data.data.data.associated_quotes);
                setTopRelationships?.(data.data.data.top_relationships);
                setPlotSummaries?.(data.data.data.plot_summaries); 
                setCoverUrl?.(data.data.data.cover_url);
                setCharacterSentimentValues?.(data.data.data.character_sentiment);
                setChapterNetworkData?.(data.data.data.chapter_network);
                setDone(true);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [taskId, done]);   

    useEffect(() => {
        if (done) {
            navigate(`/analysis/${novelId}`);
        }
    }, [done, novelId, navigate, associatedQuotes]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center pb-48 h-screen">
                <div className="text-3xl font-serif mb-4 text-black shimmer">{status}</div>
            </div>
        </>
    )
}

export default Processing;