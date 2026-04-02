import { useState } from "react";
import { Plus } from "lucide-react";

interface MotifCardProps {
    title: string;
    description: string;
    count?: number;
    motifs?: string[];
}

const MotifCard = ({ title, description, count, motifs }: MotifCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-md p-8 h-full flex flex-col">
            <h2 className="text-base font-semibold mb-2 text-left">
                {title} <span className="text-sm font-normal text-gray-400">({count})</span>
            </h2>
            <hr className="border-gray-300 mb-4" />
            <div className="flex-1 flex flex-col justify-between">
                <p className="text-gray-700 flex-1">{description}</p>
            </div>
            <hr className="border-gray-300 mt-4" />
            <div className="flex items-center justify-between mt-4 cursor-pointer hover:text-gray-500" onClick={() => setIsExpanded(e => !e)}>
                <p className="text-sm text-gray-700 mt-2 text-left"> 
                    {isExpanded ? "Hide Submotifs" : "View Submotifs"}
                </p>
                <Plus className={`w-5 h-5 text-gray-700 transition-transform ${isExpanded ? "rotate-45" : ""}`} />
            </div>

            {isExpanded && motifs && (
                <div className={`flex flex-wrap gap-2 overflow-hidden transition-all duration-300 ${isExpanded && motifs ? "max-h-96 mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
                    {motifs?.map((motif, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                            {motif}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MotifCard;