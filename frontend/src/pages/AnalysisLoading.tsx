import { useState, useEffect } from "react"
import axios from "axios"

const AnalysisLoading = () => {
    useEffect(() => {
        const fetchCharacterData = async () => {
            const data = await axios.get(`${import.meta.env.VITE_API_URL}/novel/1/characters`)
            console.log("Fetched character data:", data.data)
        }
        fetchCharacterData();
    }, [])

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