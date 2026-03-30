import { useEffect, useState } from "react"
import axios from "axios"
import BookSearchResult from "./BookSearchResult"


const Modal = ({ showModal, setShowModal, setBlur, setBookId }: { showModal: boolean, setShowModal: React.Dispatch<React.SetStateAction<boolean>>, setBlur: React.Dispatch<React.SetStateAction<boolean>>, setBookId: React.Dispatch<React.SetStateAction<string>> }) => {
    const [books, setBooks] = useState<any[]>([])
    const [page, setPage] = useState<number>(1)
    const [loading, setLoading] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState<string>("")

    const BOOKS_API_URL = `https://project-gutenberg-free-books-api1.p.rapidapi.com/books?page=${page}&title=${encodeURIComponent(searchTerm)}`

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await axios.get(BOOKS_API_URL, {
                    headers: {
                        "X-RapidAPI-Key": import.meta.env.VITE_PROJECT_GUTENBERG_API_KEY,
                        "X-RapidAPI-Host": "project-gutenberg-free-books-api1.p.rapidapi.com"
                    }
                })
                setBooks(res.data.results)
            } catch (error) {
                console.error("Error fetching books:", error)
            }
        }

        if (showModal) {
            setLoading(true)
            fetchBooks().finally(() => setLoading(false))
        }
    }, [showModal, page, searchTerm])

    if (!showModal) return null;

    return (
        <div className="fixed w-2/3 rounded-lg h-4/5 mx-auto my-auto inset-0 bg-white border border-black flex flex-col z-50 animate-fade-in">
            <button className="absolute cursor-pointer top-2 right-2 text-gray-500 hover:text-gray-700 text-3xl leading-none mt-2" onClick={() => { setShowModal(false); setBlur(false); }}>
                &times;
            </button>

            <div className="shrink-0 p-6 pb-0">
                <input type="search" placeholder="Search books..." className="border border-gray-300 rounded px-4 py-2 w-full mt-4" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <p>Loading books...</p>
                ) : books.length > 0 ? (
                    <ul>
                        {books.map((book) => (
                            <BookSearchResult 
                                key={book.id}
                                title={book.title}
                                author={book.authors[0]?.name || "Unknown Author"}
                                coverImageUrl={book.cover_image || ""}
                                onSelect={() => { setBookId(book.id); setShowModal(false); setBlur(false); }}
                            />
                        ))}
                    </ul>
                ) : (
                    <p>No books found.</p>
                )}
            </div>

            <div className="shrink-0 flex justify-center p-4 border-t border-gray-200">
                <button onClick={() => setPage((prev) => prev - 1)} disabled={page === 1} className="bg-gray-300 text-gray-700 px-3 py-1 rounded mr-2 hover:bg-gray-400 disabled:opacity-50">
                    Previous
                </button>
                <button onClick={() => setPage((prev) => prev + 1)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400">
                    Next
                </button>
            </div>
        </div>
    )
}

export default Modal;