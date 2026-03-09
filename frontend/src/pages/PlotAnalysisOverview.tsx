import AreaChart from "../components/PlotAreaChart"
import Breadcrumbs from "../components/Breadcrumbs"
import Navbar from "../components/Navbar"
import NetworkGraph from "../components/NetworkGraph"
import PlotAreaChart from "../components/PlotAreaChart"
import { useParams } from "react-router-dom"
import { useContext } from "react"
import { BookContext } from "../contexts/bookContext"

const PlotAnalysisLanding = () => {
    const novelId = useParams<{ novelId: string }>().novelId;

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Plot Analysis" }]} />
                <h1 className="text-5xl font-serif">Plot Analysis</h1>
                <p className="font-dewi mt-4 text-gray-600 text-sm max-w-3xl">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
            </div>
            <hr className="border-gray-300 my-4"/>
            <div className="flex flex-col gap-12 mt-4">
                <div className="flex flex-row justify-between ">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-dewi">Plot Sentiment Over Time</h1>
                        <PlotAreaChart 
                            width={1250}
                            height={400}
                        />
                    </div>   
                    <div className="flex flex-col gap-2">
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlotAnalysisLanding