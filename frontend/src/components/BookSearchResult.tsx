interface BookSearchResultProps {
    title: string;
    author: string;
    coverImageUrl: string;
    selected?: boolean;
    onSelect?: () => void;
}

const BookSearchResult = ({ title, author, coverImageUrl, selected, onSelect }: BookSearchResultProps) => {
    return (
        <div className="flex items-center justify-between mb-4 p-2 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200" onClick={onSelect}>
            <div className="flex items-center">
                {coverImageUrl && <img src={coverImageUrl} alt={title} className="w-16 h-16 mr-4 object-cover rounded" />}
                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold">{title}</h1>
                    <p className="text-gray-600">{author}</p>
                </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 shrink-0 ml-4 flex items-center justify-center ${selected ? 'border-green-500' : 'border-gray-300'}`}>
                {selected && <div className="w-3 h-3 rounded-full bg-green-500" />}
            </div>
        </div>
    )
}

export default BookSearchResult;