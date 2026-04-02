import { useEffect, useState } from "react"
import axios from "axios"
import BookSearchResult from "./BookSearchResult"
import { Loader2 } from "lucide-react";
import { Check } from "lucide-react";

const Modal = ({ showModal, setShowModal, setBlur, setBookId }: { showModal: boolean, setShowModal: React.Dispatch<React.SetStateAction<boolean>>, setBlur: React.Dispatch<React.SetStateAction<boolean>>, setBookId: React.Dispatch<React.SetStateAction<string>> }) => {
    const [books, setBooks] = useState<any[]>([])
    const [page, setPage] = useState<number>(1)
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedBook, setSelectedBook] = useState<any>(null)
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
            <button className="absolute cursor-pointer top-2 right-2 text-gray-500 hover:text-gray-700 text-3xl leading-none mt-2" onClick={() => { setShowModal(false); setBlur(false); setSelectedBook(null); }}>
                &times;
            </button>

            <div className="shrink-0 p-6 pb-0">
                <input type="search" placeholder="Search books..." className="border border-gray-300 rounded px-4 py-2 w-full mt-4" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex flex-col gap-4 justify-center items-center h-full">
                        <Loader2 className="animate-spin" />
                        <p className="font-serif text-lg text-gray-800">
                            Fetching books...
                        </p>
                    </div>
                ) : books.length > 0 ? (
                    <ul>
                        {books.map((book) => (
                            <BookSearchResult 
                                key={book.id}
                                title={book.title}
                                author={book.authors[0]?.name || "Unknown Author"}
                                coverImageUrl={book.cover_image || ""}
                                selected={selectedBook?.id === book.id}
                                onSelect={() => { setSelectedBook(book); }}
                            />
                        ))}
                    </ul>
                ) : (
                    <p>No books found.</p>
                )}
            </div>

            <div className="shrink-0 flex justify-center p-4 border-t border-gray-200 font-dewi">
                <div className="flex-1" />
                <div className="flex gap-2">
                    <button onClick={() => setPage((prev) => prev - 1)} disabled={page === 1} className="bg-gray-300 text-gray-700 px-3 py-1 rounded mr-2 enabled:hover:bg-gray-400 disabled:opacity-50 transition-colors duration-300 enabled:cursor-pointer">
                        Previous
                    </button>
                    <button onClick={() => setPage((prev) => prev + 1)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 cursor-pointer transition-colors duration-300">
                        Next
                    </button>
                </div>
                <div className="flex-1 flex justify-end">
                    <button onClick={() => setBookId(selectedBook.id)} disabled={!selectedBook} className="bg-green-500 text-white px-4 py-2 rounded justify-end ml-4 hover:bg-green-600 disabled:opacity-50 transition-colors duration-300 cursor-pointer">
                        <Check className="inline-block w-5 h-5 mr-2" />
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Modal;