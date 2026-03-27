import { useContext, useEffect } from "react";
import { BookContext } from "../contexts/bookContext";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import { useParams } from "react-router-dom";
import RadarComponent from "../components/RadarComponent";



const Vocabulary = () => {
    const novelId = useParams<{ novelId: string }>().novelId;
    const bookTitle = useContext(BookContext)?.title || "Novel";

    useEffect(() => {
        document.title = `Vocabulary Richness | ${bookTitle}`;
    }, [bookTitle]);

    return (
        <div className="mx-auto container px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Vocabulary", url: `/vocabulary/${novelId}` }]} />
                <h1 className="text-5xl font-serif mb-4">Vocabulary Richness</h1>
                <p className="text-md text-gray-700">
                    This page analyzes the richness of the novel's vocabulary, including unique words, lexical diversity, and more.
                </p>
            </div>
            <hr className="my-4 border-gray-300" />
            <div>
                <RadarComponent />
            </div>
        </div>
    );
}

export default Vocabulary;