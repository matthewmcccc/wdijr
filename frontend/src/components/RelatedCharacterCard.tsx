import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BookContext } from "../contexts/bookContext";
import humanize from "../utils/humanize";

const RelatedCharacterCard = ({ name, image_url, quoteCount, sentiment }: { name: string, image_url?: string, quoteCount: number, sentiment?: number }) => {
    const navigate = useNavigate();
    const novelData = useContext(BookContext)?.novelData;
    const novelId = novelData?.id;

    const borderColor = sentiment !== undefined
        ? sentiment > 0 ? "border-l-green-500" : sentiment < 0 ? "border-l-red-500" : "border-l-gray-400"
        : "border-l-gray-300";

    const dotColor = sentiment !== undefined
        ? sentiment > 0 ? "bg-green-500" : sentiment < 0 ? "bg-red-500" : "bg-gray-400"
        : "bg-gray-300";

    return (
        <div 
            onClick={() => navigate(`/character/${novelId}/${name.toLowerCase().replace(/\s+/g, '-')}`)}
            className={`mb-4 p-3 border border-gray-200 border-l-4 ${borderColor} rounded-lg cursor-pointer hover:shadow-sm transition-shadow duration-300`}
        >
            <div className="flex items-center gap-3">
                {image_url && (
                    <img 
                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${image_url}`} 
                        alt={name} 
                        className="rounded-full w-10 h-10 object-cover" 
                    />
                )}
                <div className="flex-1">
                    <h2 className="text-base font-serif">{humanize(name)}</h2>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{quoteCount} exchanges</span>
                </div>
            </div>
        </div>
    )
}

export default RelatedCharacterCard;