import { useState, useEffect } from "react"
import FilePicker from "../components/FilePicker"
import axios from "axios"

type AppState = "idle" | "processing" | "done"

export default function Home() {
    const [taskId, setTaskId] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [appState, setAppState] = useState<AppState>("idle")

    const sendFile = async (selectedFile: File) => {
        setAppState("processing")
        const formData = new FormData()
        formData.append("file", selectedFile)
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            setTaskId(res.data.task_id)
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
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/task/${taskId}`)
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

    return (
        <>
            {appState == "idle" && (
                <div className="flex flex-col justify-center items-center h-screen">
                    <h1 className="text-2xl font-bold text-left">What Did I Just Read?</h1>
                    <p>A web-tool for analysing literature</p>
                    
                    <FilePicker  onFileSelect={handleFileSelect} />
                </div>
            )}
            {appState == "processing" && <p className="mt-4">Processing file: {file?.name}</p>}
            {appState == "done" && <p className="mt-4">Done processing file: {file?.name}</p>}
        </>
    )
}