import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { BookContext } from "../contexts/bookContext";
import Navbar from "../components/Navbar";

const Processing = () => {
    const taskId = useParams().taskid;
    const ctx = useContext(BookContext);
    const navigate = useNavigate();

    const [done, setDone] = useState(false);
    const [status, setStatus] = useState<string>("Processing...");
    const [novelId, setNovelId] = useState<string | null>(null);

    useEffect(() => {
        if (done || !ctx) return;

        const pollInterval = setInterval(async () => {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/analysis/process/${taskId}`);
            setStatus(data.data.detail || "Processing...");

            if (data.data.status === "complete") {
                const result = data.data.data;
                ctx.setTitle?.(result.title);
                ctx.setNetworkData?.(result.conversational_network);
                ctx.setSentimentValues?.(result.sentiment_values);
                ctx.setInflectionPoints?.(result.inflection_points);
                ctx.setCharacterData?.(result.characters);
                setNovelId(result.novel_id);
                ctx.setAssociatedQuotes?.(result.associated_quotes);
                ctx.setTopCharacterRelationships?.(result.top_relationships);
                ctx.setPlotSummaries?.(result.plot_summaries);
                ctx.setCoverUrl?.(`${import.meta.env.VITE_API_URL.replace('/api', '')}${result.cover_url}`);
                ctx.setCharacterSentimentValues?.(result.character_sentiment);
                ctx.setChapterNetworkData?.(result.chapter_network);
                ctx.setChapterLengths?.(result.chapter_lengths);
                ctx.setCooccurrenceNetworkData?.(result.cooccurrence_network);
                ctx.setAuthorData?.(result.author_details);
                ctx.setMotifData?.(result.motifs.motif_groups);
                ctx.setChapterOccurenceData?.(result.character_chapter_occurences);
                setDone(true);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [taskId, done, ctx]);

    useEffect(() => {
        document.title = "Processing Analysis";
    }, []);

    useEffect(() => {
        if (done && novelId) {
            navigate(`/analysis/${novelId}`);
        }
    }, [done, novelId, navigate]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center pb-48 h-screen">
                <div className="text-3xl font-serif mb-4 text-black shimmer">
                    {status}
                </div>
            </div>
        </>
    );
};

export default Processing;