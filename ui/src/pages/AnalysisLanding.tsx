import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnalysisItem from "../components/AnalysisItem";
import GraphImage from "../assets/img/chart.png"

interface AnalysisProps {
    text_title: string
}

const AnalysisLanding = () => {
    return (
        <div className="">
            <Navbar />
                <div className="mt-20">
                    <div className="font-serif text-5xl text-center underline">
                        Wuthering Heights
                    </div>
                    <div className="flex flex-row gap-12 mt-20 ml-80">
                        <AnalysisItem 
                            analysis_type="Character Analysis" 
                            img={GraphImage} 
                            url="/character-analysis" 
                            description="View a list of characters and their details, as well as interactive
                            visualisations."
                        />
                    </div>
                </div>
        </div>
    )
}

export default AnalysisLanding;