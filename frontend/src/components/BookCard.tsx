const BookCard = ({ title, author, coverUrl, description }) => {
    return (
        <div className="font-serif mx-auto flex items-top flex-row gap-4">
            <img src={coverUrl} alt="Cover Image" className="w-48 mb-2 border-2 border-gray-300 rounded-md p-2" />
            <div className="mt-2">
                <h1 className="text-4xl">{title}</h1>
                <h2 className="text-2xl text-gray-700">{author}</h2>
                <p className="text-gray-600 mt-2">
                    {description}
                </p>
            </div>
        </div>
    )
}

export default BookCard;