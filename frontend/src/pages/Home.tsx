import { useState, useEffect } from "react"
import uploadIcon from "../assets/img/upload_icon.png"
import bookIcon from "../assets/img/book_icon.png"
import axios from "axios"
import Navbar from "../components/Navbar"
import { Navigate, useNavigate } from "react-router-dom"

type AppState = "idle" | "processing" | "done"

const Home = () => {
    const [taskId, setTaskId] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [appState, setAppState] = useState<AppState>("idle")
    const [status, setStatus] = useState<string>("")

    const navigate = useNavigate();

    const sendFile = async (selectedFile: File) => {
        setAppState("processing")
        const formData = new FormData()
        formData.append("file", selectedFile)
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/analysis/process`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            setTaskId(res.data.task_id)
            navigate(`/processing/${res.data.task_id}`)
        } catch (error) {
            console.error("Error processing file:", error)
            setAppState("idle")
        }
    }

    const handleFileSelect = async (selectedFile: File | null) => {
        setFile(selectedFile)
        if (selectedFile) {
            await sendFile(selectedFile)
        } else {
            setAppState("idle")
        }
    }

    useEffect(() => {
        if (!taskId && appState !== "processing") return

        const pollInterval = setInterval(async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/analysis/process/${taskId}`)
                if (res.data.state === "SUCCESS") {
                    setAppState("done")
                    clearInterval(pollInterval)
                }
            } catch (error) {
                console.error("Error polling task status:", error)
                clearInterval(pollInterval)
                setAppState("idle")
            }
        }, 2000)

        return () => clearInterval(pollInterval)
    }, [appState, taskId])

    useEffect(() => {
        document.title = "What Did I Just Read?"
    }, [])

    return (
        <>
            {appState == "idle" && (
                <div>
                    <Navbar />
                    <div className="flex flex-col gap-6 pt-60 items-center min-h-screen overflow-hidden">
                        <h1 className="text-6xl font-serif text-left">What Did I Just Read?</h1>
                        <p className="text-lg font-dewi text-brand-50">
                            Upload your own text or choose from a pre-selected
                            novel corpus for textual analysis.
                        </p>
                        <div className="flex gap-4">
                            <input id="file-upload" type="file" accept=".epub" className="hidden" onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)} />
                            <button className="bg-brand-cta text-white font-dewi py-2 px-4 rounded-4xl cursor-pointer hover:bg-brand-cta-hover
                            duration-300 transition-all
                            " onClick={() => document.getElementById("file-upload")?.click()}>
                                <img src={uploadIcon} alt="Upload Icon" className="inline-block w-5 h-5 mr-3 mb-1 fill-white
                                invert brightness-150" />
                                    Upload a Book
                            </button>
                            <button className="bg-white border-black-500 border text-black font-dewi py-2 px-4 rounded-4xl cursor-pointer hover:bg-black hover:text-white
                                duration-300 transition-all">
                                    <img src={bookIcon} alt="Book Icon" className="inline-block w-5 h-5 mr-3 mb-1 fill-white" />
                                    Choose from Corpus  
                            </button>
                        </div>
                    </div>
                </div>
                
            )}
        </>
    )
}

export default Home;