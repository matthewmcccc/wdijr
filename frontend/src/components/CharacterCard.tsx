import { image, text } from "d3";
import { use, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BookContext } from "../contexts/bookContext";
import humanize from "../utils/humanize";

const CharacterCard = ({ name, description, image_url, size, sentiment }: { name: string, img?: string, description: string, traits?: string[], size: string, sentiment?: number, image_url?: string }) => {
    const navigate = useNavigate();
    const novelData = useContext(BookContext)?.novelData;
    const novelId = novelData?.id;

    console.log(`image_url: ${image_url}`);

    return (
        <div 
            onClick={() => navigate(`/character/${novelId}/${name.toLowerCase().replace(/\s+/g, '-')}`)} 
            className={`mb-8 border border-gray-300 rounded-lg cursor-pointer hover:shadow-sm transition-shadow duration-300 ${sentiment !== undefined ? (sentiment > 0 && size == "small" ? "ring-1 ring-green-500" : sentiment < 0 && size == "small" ? "ring-1 ring-red-500" : "ring-1 ring-gray-300") : "bg-white"}`}
        >
            <div className="flex flex-col gap-4">
                <img src={`${image_url}`} alt={name} className="border border-gray-800 mx-auto mt-4 mb-4 rounded-lg w-24 h-24 object-cover" />
                <div className={`${size === "small" ? "" : "h-32"} flex flex-col text-center`}>
                    <h2 className={`text-xl font-serif text-black mb-2`}>{humanize(name)}</h2>    
                    <p className="mb-4 px-4 text-md">{description}</p>
                </div>    
                    <>
                        <div className="text-end p-4">
                            Profile &rarr;
                        </div>
                    </>
                </div>
            </div>
    )
}

export default CharacterCard;