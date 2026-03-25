import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BookContext } from "../contexts/bookContext";

const ChapterNavigation = ({ id, name, position }: { id: string, name: string, position: string }) => {
    const navigate = useNavigate();
    const novelId = useContext(BookContext)?.novelData?.id;

    return (
        <div onClick={() => navigate(`/${novelId}/chapter/${id}`)} className="cursor-pointer flex flex-row items-center gap-2 text-gray-500">
            {
                position === "left" ? <span>&lt;</span> : ""
            }
            <h2 className="text-sm font-serif text-gray-700 max-w-48 truncate">{name}</h2>
            {
                position === "right" ? <span>&gt;</span> : ""
            }
        </div>
    )
}

export default ChapterNavigation;