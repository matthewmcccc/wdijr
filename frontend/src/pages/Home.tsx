import { useState, useEffect } from "react"
import uploadIcon from "../assets/img/upload_icon.png"
import bookIcon from "../assets/img/book_icon.png"
import axios from "axios"
import Navbar from "../components/Navbar"
import Modal from "../components/Modal"
import { Navigate, useNavigate } from "react-router-dom"

type AppState = "idle" | "processing" | "downloading" | "done"

const Home = () => {
    const [taskId, setTaskId] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [appState, setAppState] = useState<AppState>("idle")
    const [status, setStatus] = useState<string>("")
    const [showModal, setShowModal] = useState<boolean>(false)
    const [blur, setBlur] = useState<boolean>(false)
    const [bookId, setBookId] = useState<string>("")

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

    useEffect(() => {
        const downloadBookAndProcess = async (id: string) => {
            setAppState("downloading")
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/analysis/download/${id}`)
                navigate(`/processing/${res.data.task_id}`)
            } catch (error) {
                console.error("Error downloading and processing book:", error)
                setAppState("idle")
            }
        }
        if (bookId) {
            downloadBookAndProcess(bookId)
        }
    }, [bookId, navigate])

    if (appState === "downloading") {
        return (
            <div className="">
                <Navbar />
                <div className="flex flex-col min-h-screen gap-6">
                    <h2 className="text-3xl font-serif pt-82 text-center shimmer">Grabbing EPUB for processing...</h2>
                </div>
            </div>
        )
    }

    return (
        <>
            {appState == "idle" && (
            <div>
                <div className={`relative h-screen overflow-hidden ${blur ? "blur-[2px]" : ""}`}>
                    <Navbar />
                    <div className="flex flex-col gap-6 pt-60 items-center h-screen overflow-hidden">
                        <h1 className="font-serif text-center text-4xl md:text-6xl lg:text-6xl">What Did I Just Read?</h1>
                        <p className="lg:text-lg font-dewi text-brand-50 text-center">
                            Upload your own text or choose from a pre-selected
                            novel corpus for textual analysis.
                        </p>
                        <div className="flex gap-4">
                            <input id="file-upload" type="file" accept=".epub" className="hidden" onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)} />
                            <button className="bg-brand-cta text-white font-dewi py-2 px-4 rounded-4xl cursor-pointer hover:bg-brand-cta-hover
                                duration-300 transition-all" onClick={() => document.getElementById("file-upload")?.click()}>
                                <img src={uploadIcon} alt="Upload Icon" className="inline-block w-5 h-5 mr-3 mb-1 fill-white
                                invert brightness-150" />
                                    Upload a Book
                            </button>
                            <button onClick={() => { setShowModal(true); setBlur(true); }} className="flex flex-row gap-2 bg-white border-black-500 border text-black font-dewi py-2 px-4 rounded-4xl cursor-pointer hover:bg-black hover:text-white
                                duration-300 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-book-open-icon lucide-book-open"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>                                    Choose from Corpus  
                            </button>
                        </div>
                    </div>
                </div>
                <Modal setBlur={setBlur} showModal={showModal} setShowModal={setShowModal} setBookId={setBookId} />
            </div>
            )}
        </>
    )
}

export default Home;