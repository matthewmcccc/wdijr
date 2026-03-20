import { text } from "d3";
import { use, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BookContext } from "../contexts/bookContext";

const CharacterCard = ({ name, img, description, traits, size, sentiment }: { name: string, img?: string, description: string, traits?: string[], size: string, sentiment?: number }) => {
    const navigate = useNavigate();
    const novelData = useContext(BookContext)?.novelData;
    const novelId = novelData?.id;

    let padding;
    let textSize;

    if (size === "small") {
        padding = "p-4";
        textSize = "lg";
    } else {
        padding = "p-6";
        textSize = "2xl";
    }

    return (
        <div 
            onClick={() => navigate(`/character/${novelId}/${name.toLowerCase().replace(/\s+/g, '-')}`)} 
            className={`mb-8 ${padding} border border-gray-300 rounded-lg cursor-pointer hover:shadow-sm transition-shadow duration-300 ${sentiment !== undefined ? (sentiment > 0 && size == "small" ? "ring-1 ring-green-500" : sentiment < 0 && size == "small" ? "ring-1 ring-red-500" : "ring-1 ring-gray-300") : "bg-white"}`}
        >
            {img && <img src={img} alt={name} className="border border-gray-800 mx-auto mb-4 rounded-lg w-24 h-30 object-cover" />}
            <h2 className={`text-${textSize} ${size == "small" ? "" : "text-center"} font-serif mb-4 text-black`}>{name}</h2>
            <div className={`${size === "small" ? "" : "h-32"}`}>
                <p className="mb-4 text-center">{description}</p>
            </div>    
            {size === "large" && (
                <>
                    <hr className="my-4" />
                    <div className="text-end">
                        Profile &rarr;
                    </div>
                </>
               )
            }
            </div>
    )
}

export default CharacterCard;