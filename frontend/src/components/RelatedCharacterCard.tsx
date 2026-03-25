import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BookContext } from "../contexts/bookContext";
import humanize from "../utils/humanize";
import defaultAvatar from "../assets/img/default-avatar.png";

const RelatedCharacterCard = ({ name, image_url, description, sentiment }: { name: string, image_url?: string, description: string, sentiment?: number }) => {
    const navigate = useNavigate();
    const novelData = useContext(BookContext)?.novelData;
    const novelId = novelData?.id;

    return (
        <div 
            onClick={() => navigate(`/character/${novelId}/${name.toLowerCase().replace(/\s+/g, '-')}`)}
            className={`mb-8 p-2 border border-gray-300 rounded-lg cursor-pointer hover:shadow-sm transition-shadow duration-300 ${sentiment !== undefined ? (sentiment > 0  ? "ring-1 ring-green-500" : sentiment < 0    ? "ring-1 ring-red-500" : "ring-1 ring-gray-300") : "bg-white"}`}>
                    {description ? (
                        <div className="flex flex-row gap-4">
                            <img src={image_url ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${image_url}` : defaultAvatar} alt={name} className="border border-gray-800 mx-auto mb-4 rounded-lg w-12 h-15 object-cover p-1" />
                            <div className={`flex flex-col text-left`}>
                                <h2 className={`text-lg font-serif text-black`}>{humanize(name)}</h2>    
                                <p className="mb-4 text-sm">{description}</p>
                            </div>    
                        </div>
                    ) : (
                        <div className="flex flex-row">
                            <div className={`flex flex-row text-center gap-4`}>
                                <img src={image_url ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${image_url}` : defaultAvatar} alt={name} className="border border-gray-800 mx-auto mb-4 rounded-lg w-15 h-20 object-cover p-1" />
                                <h2 className={`text-lg font-serif text-black text-center my-auto`}>{humanize(name)}</h2>    
                            </div>    
                        </div>
                    )}
        </div>
    )
}

export default RelatedCharacterCard;