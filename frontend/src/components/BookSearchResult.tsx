interface BookSearchResultProps {
    title: string;
    author: string;
    coverImageUrl: string;
    onSelect?: () => void;
}

const BookSearchResult = ({ title, author, coverImageUrl, onSelect }: BookSearchResultProps) => {
    return (
        <div className="flex items-center mb-4 p-2 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200" onClick={onSelect}>
            {coverImageUrl && <img src={coverImageUrl} alt={title} className="w-16 h-16 mr-4 object-cover rounded" />}
            <div className="flex flex-col">
                <h1 className="text-lg font-semibold">{title}</h1>
                <p className="text-gray-600">{author}</p>
            </div>
        </div>
    )
}

export default BookSearchResult;