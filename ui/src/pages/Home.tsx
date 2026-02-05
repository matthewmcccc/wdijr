import { useState } from "react"
import FilePicker from "../components/FilePicker"
import axios from "axios"

type AppState = "idle" | "processing" | "done"

export default function Home() {
    const [file, setFile] = useState<File | null>(null)
    const [appState, setAppState] = useState<AppState>("idle")

    const sendFile = async (selectedFile: File) => {
        setAppState("processing")
        const formData = new FormData()
        formData.append("file", selectedFile)
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            setAppState("done")
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