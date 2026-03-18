import { Navigate, useNavigate } from "react-router-dom";

interface AnalysisItemProps {
    analysis_type: string;
    img: string;
    description?: string;
    url?: string;
}

export default function AnalysisItem({ analysis_type, img, description, url }: AnalysisItemProps) {
    const navigate = useNavigate();

    return (
        <div className="rounded-md w-full mx-auto border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => navigate(url || "/")}>
            <div className="font-serif text-2xl mb-2 px-6 mt-4">{analysis_type}</div>
            <div className="px-6 font-dewi text-sm text-gray-400">
                {description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
            </div>
            <div className="">
                {img ? (
                    <img className="pointer-events-none h-48 select-none" src={img} alt={analysis_type} id="analysisImage"/>
                ) : (
                    <div className="bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Image Placeholder</span>
                    </div>
                )}
                {/* <div className="flex justify-end">
<                   button className="cursor-pointer px-4 py-2 font-dewi font-bold text-lg">
                        View
                    </button>
                </div> */}
            </div>
        </div>
    )
}