import { Navigate, useNavigate } from "react-router-dom";
import { BookContext } from "../contexts/bookContext";
import { useContext } from "react";

const ChapterCard = ({
    id,
    number,
    title,
    overview,
}) => {
    const navigate = useNavigate();
    const novelId = useContext(BookContext)?.novelData?.id;

    return (
        <div onClick={() => navigate(`/${novelId}/chapter/${number}`)} className="font-serif bg-white rounded-lg shadow-md mb-8 mb-8 p-6 border border-gray-300 rounded-lg cursor-pointer hover:shadow-sm transition-shadow duration-300">
            <h2 className="text-xl mb-4">{title}</h2>
            <p className="text-gray-600 text-sm mb-4">{overview}</p>
        </div>
    )
}

export default ChapterCard;