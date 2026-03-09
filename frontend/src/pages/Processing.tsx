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
    const topRelationships = useContext(BookContext)?.topCharacterRelationships;
    const setTopRelationships = useContext(BookContext)?.setTopCharacterRelationships;
    const associatedQuotes = useContext(BookContext)?.associatedQuotes;
    const characterData = useContext(BookContext)?.characterData;
    const networkData = useContext(BookContext)?.networkData;
    const setSentimentValues = useContext(BookContext)?.setSentimentValues;
    const setInflectionPoints = useContext(BookContext)?.setInflectionPoints;
    const navigate = useNavigate();

    useEffect(() => {
        if (done) return;

        const pollInterval = setInterval(async () => {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/analysis/process/${taskId}`)
            setStatus(data.data.detail || "Processing...");
        if (data.data.status == "complete") {
                setNetworkData?.(data.data.data.network);
                setSentimentValues?.(data.data.data.sentiment_values);
                setInflectionPoints?.(data.data.data.inflection_points);
                setCharacterData?.(data.data.data.characters);
                setNovelId(data.data.data.novel_id);
                setAssociatedQuotes?.(data.data.data.associated_quotes);
                setTopRelationships?.(data.data.data.top_relationships);
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
                <div className="text-2xl font-serif mb-4 text-black">{status}</div>
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
            </div>
        </>
    )
}

export default Processing;