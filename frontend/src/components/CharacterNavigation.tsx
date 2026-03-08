import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BookContext } from "../contexts/bookContext";

const CharacterNavigation = ({ name, position }: { name: string, position: string }) => {
    const navigate = useNavigate();
    const novelId = useContext(BookContext)?.novelData?.id;

    return (
        <div onClick={() => navigate(`/character/${novelId}/${name.toLowerCase().replace(/\s+/g, '-')}`)} className="cursor-pointer flex flex-row items-center gap-2 text-gray-500">
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