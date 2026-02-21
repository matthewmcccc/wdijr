import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnalysisItem from "../components/AnalysisItem";

interface AnalysisProps {
    text_title: string
}

export default function AnalysisLanding() {
    return (
        <div className="">
            <Navbar />
            <div className="mt-24 ml-80">
                {/* sidebar to do later maybe */}
                <div className="flex gap-8">
                    {/* <div className="max-w-1xl bg-brand-cta-hover min-h-screen w-xs"> */}
                    {/* </div> */}
                    <div className="font-serif text-5xl">
                        Wuthering Heights
                    </div>
                </div>
                <div className="flex flex-row gap-12 mt-12">
                    <AnalysisItem analysis_type="Character Analysis" img="" />
                    <AnalysisItem analysis_type="Plot Analysis" img="" />
                    <AnalysisItem analysis_type="Theme Analysis" img="" />
                </div>
            </div>
        </div>
    )
}