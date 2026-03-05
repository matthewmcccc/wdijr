import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import { BookContext } from "../contexts/bookContext";
import { Navigate, useNavigate } from "react-router";

const Processing = () => {
    const taskId = useParams().taskid;
    const [done, setDone] = useState(false);
    const [status, setStatus] = useState<string>("Processing...");

    useEffect(() => {
        if (done) return;

        const pollInterval = setInterval(async () => {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/analysis/process/${taskId}`)
            setStatus(data.data.detail || "Processing...");
            if (data.data.status == "complete") {
                setDone(true);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [taskId, done]);   

    return (
        <>
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="text-2xl font-serif mb-4 text-black">{status}</div>
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
            </div>
        </>
    )
}

export default Processing;