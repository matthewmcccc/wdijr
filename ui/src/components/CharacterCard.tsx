import { text } from "d3";
import { useNavigate } from "react-router-dom";

const CharacterCard = ({ name, description, traits, size }: { name: string, description: string, traits: string[], size: string }) => {
    const navigate = useNavigate();
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
        <div onClick={() => navigate(`/character/${name.toLowerCase().replace(/\s+/g, '-')}`)} className={`mb-8 ${padding} border border-gray-300 rounded-lg cursor-pointer hover:shadow-sm transition-shadow duration-300`}>
            <h2 className={`text-${textSize} font-serif mb-4`}>{name}</h2>
            <p className="mb-4">{description}</p>
            <div>
                <ul className="list-none list-inside flex flex-row gap-4">
                    {traits.map((trait, index) => (
                        <li className="bg-gray-200 rounded-lg px-2 text-sm text-black" key={index}>{trait}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default CharacterCard;