import { useNavigate } from "react-router-dom";

const CharacterNavigation = ({ name, position }: { name: string, position: string }) => {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate(`/character/${name.toLowerCase().replace(/\s+/g, '-')}`)} className="cursor-pointer flex flex-row items-center gap-2 text-gray-500">
            {
                position === "left" ? <span>&lt;</span> : ""
            }
            <h2 className="text-xl font-serif text-gray-700">{name}</h2>
            {
                position === "right" ? <span>&gt;</span> : ""
            }
        </div>
    )
}

export default CharacterNavigation;