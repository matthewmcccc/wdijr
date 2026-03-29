import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BookContext } from "../contexts/bookContext";

const ChapterNavigation = ({ id, name, position }: { id: string, name: string, position: string }) => {
    const navigate = useNavigate();
    const novelId = useContext(BookContext)?.novelData?.id;

    return (
        <div onClick={() => navigate(`/${novelId}/chapter/${id}`)} className="cursor-pointer text-gray-500 hover:text-gray-700">
            {position === "left" ? <span>&lt;</span> : <span>&gt;</span>}
        </div>
    )
}

export default ChapterNavigation;