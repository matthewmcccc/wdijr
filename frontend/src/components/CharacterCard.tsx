import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BookContext } from "../contexts/bookContext";
import humanize from "../utils/humanize";

const CharacterCard = ({ name, description, image_url }: { name: string, description: string, image_url?: string }) => {
    const navigate = useNavigate();
    const novelData = useContext(BookContext)?.novelData;
    const novelId = novelData?.id;

    const hasImage = image_url && !image_url.includes("default-avatar");

    return (
        <div 
            onClick={() => navigate(`/character/${novelId}/${name.toLowerCase().replace(/\s+/g, '-')}`)} 
            className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg cursor-pointer hover:shadow-sm transition-shadow duration-300"
        >
            {hasImage && (
                <img src={image_url} alt={name} className="rounded-full w-12 h-12 object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
                <h2 className="text-lg font-serif">{humanize(name)}</h2>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    )
}

export default CharacterCard;