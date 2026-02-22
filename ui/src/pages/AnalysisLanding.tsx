import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnalysisItem from "../components/AnalysisItem";
import GraphImage from "../assets/img/chart.png"

interface AnalysisProps {
    text_title: string
}

export default function AnalysisLanding() {
    return (
        <div className="">
            <Navbar />
                <div className="mt-20">
                    <div className="font-serif text-5xl text-center underline">
                        Wuthering Heights
                    </div>
                    <div className="flex flex-row gap-12 mt-20 ml-80">
                        <AnalysisItem analysis_type="Character Analysis" img={GraphImage} />
                    </div>
                </div>
        </div>
    )
}