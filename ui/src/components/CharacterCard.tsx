import { useNavigate } from "react-router-dom";

const CharacterCard = ({ name, description, traits }: { name: string, description: string, traits: string[] }) => {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate(`/character/${name.toLowerCase().replace(/\s+/g, '-')}`)} className="mb-8 p-6 border border-gray-300 rounded-lg cursor-pointer hover:shadow-sm transition-shadow duration-300">
            <h2 className="text-3xl font-serif mb-4">{name}</h2>
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