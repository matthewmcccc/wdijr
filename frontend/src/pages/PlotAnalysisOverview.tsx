import Breadcrumbs from "../components/Breadcrumbs"
import Navbar from "../components/Navbar"
import ChapterCard from "../components/ChapterCard"
import PlotAreaChart from "../components/PlotAreaChart"
import { useParams } from "react-router-dom"
import { useContext, useEffect, useRef } from "react"
import { BookContext } from "../contexts/bookContext"
import fetchNovelData from "../utils/fetchNovelData"

const PlotAnalysisLanding = () => {
    const novelId = useParams<{ novelId: string }>().novelId;
    const bookContext = useContext(BookContext);
    const novelData = bookContext?.novelData;
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
    const hasFetched = useRef<string | null>(null);
    const title = bookContext?.title;

    console.log("render", novelData?.id, novelId);

    useEffect(() => {
        const fetchData = async () => {
            if (hasFetched.current === novelId) return;
            hasFetched.current = novelId ?? null;

            if (setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues && setChapterData) {
                await fetchNovelData(novelId ?? "", setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData);
            }
        };
        fetchData();
    }, [novelId]);

    console.log(`chapterData: ${JSON.stringify(bookContext?.chapterData)}`);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Plot Analysis" }]} />
                <h1 className="text-5xl font-serif">Plot Analysis</h1>
                <p className="font-dewi mt-4 text-gray-600 text-sm max-w-3xl">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
            </div>
            <hr className="border-gray-300 my-4"/>
            <div className="flex flex-col gap-12 mt-4 h-150">
                <div className="flex flex-row justify-between ">
                    <div className="flex flex-col gap-2">
                        <div className="border border-gray-300 rounded-lg p-4">
                            <h1 className="text-center text-lg font-serif">{title} | Plot Sentiment & Key Events</h1>
                            <PlotAreaChart 
                                width={1250}
                                height={500}
                            />
                        </div>
                    </div>   
                    <div className="flex flex-col gap-2">
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 mt-4">
                <h1 className="font-serif text-4xl">
                    Chapters
                </h1>
                <hr className="border-gray-300 my-4"/>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookContext?.chapterData?.map(chapter => (
                        <ChapterCard
                            id={chapter.id}
                            number={chapter.chapter_number}
                            title={chapter.title}
                            overview={chapter.overview}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PlotAnalysisLanding