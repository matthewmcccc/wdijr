import { useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import { BookContext } from "../contexts/bookContext";
import fetchNovelData from "../utils/fetchNovelData";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import AnalysisItem from "../components/AnalysisItem";
import Quill from "../assets/img/ink_and_quill.png"


const Miscellany = () => {
    const bookContext = useContext(BookContext);
    const { novelId } = useParams<{ novelId: string }>();
    const setNovelData = bookContext?.setNovelData;
    const setCharacterData = bookContext?.setCharacterData;
    const setNetworkData = bookContext?.setNetworkData;
    const setTitle = bookContext?.setTitle;
    const setQuoteData = bookContext?.setQuoteData;
    const setPlotSummaries = bookContext?.setPlotSummaries;
    const setSentimentValues = bookContext?.setSentimentValues;
    const setInflectionPoints = bookContext?.setInflectionPoints;
    const setCoverUrl = bookContext?.setCoverUrl;
    const setCharacterSentimentValues = bookContext?.setCharacterSentimentValues;
    const setChapterData = bookContext?.setChapterData;
    const setChapterNetworkData = bookContext?.setChapterNetworkData;
    const setCooccurrenceNetworkData = bookContext?.setCooccurrenceNetworkData;
    const title = bookContext?.title || "";

    useEffect(() => {   
        const fetchData = async () => {
            if (novelId && setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues && setChapterData && setChapterNetworkData && setCooccurrenceNetworkData) {
                await fetchNovelData(novelId, setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData);
            }
        };
        fetchData();
    }, [novelId, setCharacterData, setTitle, setNetworkData, setQuoteData, setSentimentValues, setInflectionPoints, setPlotSummaries, setCoverUrl, setNovelData, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData]);


    useEffect(() => {
        document.title = `Miscellany | ${title}`;
    }, [title]);
    

    const MiscellanyItems = [
        {
            title: "About the Author",
            description: "Learn more about the author of the novel, including their background, influences, and other works.",
            url: `/author/${novelId}`,
            image: Quill
        },
        {
            title: "Themes and Motifs",
            description: "Explore the major themes and motifs present in the novel, and how they contribute to the overall narrative.",
            url: `/themes/${novelId}`,
            image: ""
        },
        {
            title: "Vocabulary Richness",
            description: "Analyze the richness of the novel's vocabulary, including unique words, lexical diversity, and more.",
            url: `/vocabulary/${novelId}`,
            image: ""
        },{
            title: "About the Author",
            description: "Learn more about the author of the novel, including their background, influences, and other works.",
            url: `/author/${novelId}`,
            image: ""
        },
        {
            title: "Themes and Motifs",
            description: "Explore the major themes and motifs present in the novel, and how they contribute to the overall narrative.",
            url: `/themes/${novelId}`,
            image: ""
        },
        {
            title: "Vocabulary Richness",
            description: "Analyze the richness of the novel's vocabulary, including unique words, lexical diversity, and more.",
            url: `/vocabulary/${novelId}`,
            image: ""
        },
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Miscellany", url: `/miscellany/${novelId}` }]} />
                <h1 className="text-5xl font-serif mb-4">Miscellany</h1>
                <p className="text-lg text-gray-700">
                    This page is a sandbox for testing out new features, visualizations, and analyses that don't fit into the main categories of character or plot analysis. Check back here for experimental content and previews of upcoming features!
                </p>
            </div>
            <hr className="border-gray-300 my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MiscellanyItems.map((item, index) => (
                    <AnalysisItem 
                        key={index}
                        analysis_type={item.title} 
                        img={item.image} 
                        url={item.url} 
                        description={item.description}
                    />
                ))}
            </div>
        </div>
    )
}

export default Miscellany;