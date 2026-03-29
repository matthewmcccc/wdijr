import { useContext } from "react";
import { BookContext } from "../contexts/bookContext";

const Breadcrumbs = ({ items }: { items: { label: string; url?: string }[] }) => {
    const novelData = useContext(BookContext)?.novelData;

    return (
        <div className="mb-8 mt-8 text-center md:text-left md:mb-4 md:mt-4">
            <nav className="text-sm font-dewi text-gray-500 mb-4 rounded-md border-gray-400
                max-w-md">
                    {items.map((item, index) => (
                        <span key={index}>
                            {item.url ? (
                                <a href={item.url} className="hover:underline">
                                    {item.label}
                                </a>
                            ) : (
                                <span>{item.label}</span>
                            )}
                            {index < items.length - 1 && <span className="mx-2">/</span>}
                        </span>
                    ))}
            </nav>
        </div>
       
    )
}

export default Breadcrumbs;