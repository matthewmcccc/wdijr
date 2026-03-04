import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { BookContext } from "../contexts/bookContext";
import { Navigate, useNavigate } from "react-router";

const AnalysisLoading = () => {
    const { setCharacterData } = useContext(BookContext) || {};
    const [done, setDone] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCharacterData = async () => {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/novel/1/characters`)
            if (setCharacterData) {
                setCharacterData(data.data);
            }
            setDone(true);
        }
        fetchCharacterData();
    }, [])

    if (done) {
        return <Navigate to="/analysis/1" />
    }

    return (
        <>
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="text-2xl font-serif mb-4 text-black">Processing your analysis...</div>
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
            </div>
        </>
    )
}

export default AnalysisLoading;