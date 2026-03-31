import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import { BookContext } from "../contexts/bookContext";
import fetchNovelData from "../utils/fetchNovelData";

const Author = () => {
    const novelId = useParams().novelId;
    const title = useContext(BookContext)?.title || "";
    const setNovelData = useContext(BookContext)?.setNovelData;
    const setCharacterData = useContext(BookContext)?.setCharacterData;
    const setNetworkData = useContext(BookContext)?.setNetworkData;
    const setTitle = useContext(BookContext)?.setTitle;
    const setQuoteData = useContext(BookContext)?.setQuoteData;
    const setPlotSummaries = useContext(BookContext)?.setPlotSummaries;
    const setSentimentValues = useContext(BookContext)?.setSentimentValues;
    const setInflectionPoints = useContext(BookContext)?.setInflectionPoints;
    const setCoverUrl = useContext(BookContext)?.setCoverUrl;
    const setCharacterSentimentValues = useContext(BookContext)?.setCharacterSentimentValues;
    const setChapterData = useContext(BookContext)?.setChapterData;
    const setChapterNetworkData = useContext(BookContext)?.setChapterNetworkData;
    const setCooccurrenceNetworkData = useContext(BookContext)?.setCooccurrenceNetworkData;
    const setAuthorData = useContext(BookContext)?.setAuthorData;
    const authorData = useContext(BookContext)?.authorData;

    useEffect(() => {
        fetchNovelData(novelId, setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData, setAuthorData);
    }, [novelId, setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData, setAuthorData]);

    const otherWorks = authorData?.other_works || [];

    console.log(otherWorks);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Miscellany", url: `/miscellany/${novelId}` }, { label: "About the Author", url: `/author/${novelId}` }]} />
                <h1 className="text-4xl text-center md:text-left md:text-5xl font-serif mb-4">About the Author</h1>
                <p className="text-lg text-gray-700 text-center md:text-left">
                    This page provides information about the author of the novel. Learn more about their background, other works, and contributions to literature.
                </p>
            </div>
            <hr className="border-gray-300 my-4" />
            <div>
                {authorData && (
                    <div>
                        <div className="">
                            <img src={authorData.image_url || ""} alt={authorData.name} className="float-left mr-8 mb-4 md:h-80 md:w-60 object-cover p-4 border border-gray-400 rounded-md" />
                            <h2 className="text-3xl font-serif mb-4 text-center md:text-left">{authorData.name}</h2>
                            <p className="text-md text-gray-700 whitespace-pre-line text-center md:text-left">{authorData.description}</p>
                        </div>
                        {/* // TODO: add section for other works by the author, if data is available */}
                       
                        <div className="mt-8">
                            <h1 className="text-3xl font-serif mb-4">
                                Other Works 
                            </h1>
                            <hr className="border-gray-300 my-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                {otherWorks.map((work, index) => (
                                    <div key={index} className="border border-gray-300 rounded-md p-4">
                                        <img src={work.image_url || ""} alt={work.title} className="w-full h-48 object-cover mb-4" />
                                        <h3 className="text-xl font-semibold">{work.title}</h3>
                                        <p className="text-gray-600">{work.year}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Author;