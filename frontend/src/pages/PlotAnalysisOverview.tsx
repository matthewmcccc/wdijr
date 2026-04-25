import Breadcrumbs from "../components/Breadcrumbs";
import Navbar from "../components/Navbar";
import ChapterCard from "../components/ChapterCard";
import PlotAreaChart from "../components/PlotAreaChart";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useNovelData from "../hooks/useNovelData";
import PlotEventCard from "../components/PlotEventCard";
import useContainerSize from "../hooks/useContainerSize";
import TooltipComponent from "../components/Tooltip";

interface SelectedEvent {
    title: string;
    chapter: string;
    description: string;
    category: string;
    characters: string[];
    headline: string;
}

const CHAPTERS_PER_PAGE = 12;

const PlotAnalysisLanding = () => {
    const novelId = useParams<{ novelId: string }>().novelId;
    const ctx = useNovelData(novelId);

    const title = ctx?.title;
    const chapterData = ctx?.chapterData;

    const { containerRef, width: containerWidth, height: containerHeight } = useContainerSize();
    const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
    const [chapterPage, setChapterPage] = useState(0);

    const totalPages = chapterData ? Math.ceil(chapterData.length / CHAPTERS_PER_PAGE) : 1;
    const paginatedChapters = chapterData ? chapterData.slice(chapterPage * CHAPTERS_PER_PAGE, (chapterPage + 1) * CHAPTERS_PER_PAGE) : [];

    useEffect(() => {
        if (title) {
            document.title = `Plot Analysis | ${title}`;
        }
    }, [title]);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Plot Analysis" }]} />
                <h1 className="text-4xl text-center md:text-left md:text-5xl font-serif">Plot Analysis</h1>
                <p className="font-dewi mt-4 text-gray-600 text-center md:text-left text-md max-w-3xl">
                    View detailed summaries of chapters, key plot events, and how the emotional intensity (sentiment) of the story changes over time.
                </p>
            </div>
            <hr className="border-gray-300 my-4 w-full"/>
            <div className="flex flex-row justify-between gap-4 mt-4">
                <div className="flex-7 min-w-0">
                    <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex flex-row justify-between items-center">
                            <h1></h1>
                            <h1 className="text-center text-xl font-serif">
                                {title} | Plot Sentiment & Key Events
                            </h1>
                            <TooltipComponent
                                title={"Plot Sentiment & Key Events"}
                                content={"The line chart shows the overall sentiment of the plot across the chapters. \n\n Key plot events are marked as points on the line. \n\n Click on a point to see more details about that event."}
                            />
                        </div>
                        <hr className="border-gray-300 w-1/2 mx-auto my-4" />
                        <div ref={containerRef} className="w-full h-[500px]">
                            {containerWidth > 0 && containerHeight > 0 && (
                                <PlotAreaChart
                                    width={containerWidth}
                                    height={containerHeight}
                                    onEventClick={(event) => setSelectedEvent(event)}
                                />
                            )}
                        </div>
                    </div>
                </div>
                {selectedEvent && (
                    <div className="flex-3">
                        <PlotEventCard
                            title={selectedEvent.title}
                            headline={selectedEvent.headline}
                            chapter={chapterData?.find(c => c.chapter_number === parseInt(selectedEvent.chapter?.split(" ")[1]) - 1)?.title || selectedEvent.chapter}
                            description={selectedEvent.description}
                            characters={selectedEvent.characters}
                            eventType={selectedEvent.category}
                            onClose={() => setSelectedEvent(null)}
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4 mt-4">
                <h1 className="font-serif text-4xl">
                    Chapters
                </h1>
                <hr className="border-gray-300 my-4"/>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedChapters.map(chapter => (
                        <ChapterCard
                            key={chapter.id}
                            id={chapter.id}
                            number={chapter.chapter_number}
                            title={chapter.title}
                            overview={chapter.overview}
                        />
                    ))}
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button
                            onClick={() => setChapterPage(p => Math.max(0, p - 1))}
                            disabled={chapterPage === 0}
                            className="px-3 py-1 border rounded disabled:opacity-30 cursor-pointer"
                        >
                            ‹ Prev
                        </button>
                        <span className="text-sm text-gray-500 font-dewi">
                            {chapterPage + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => setChapterPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={chapterPage === totalPages - 1}
                            className="px-3 py-1 border rounded disabled:opacity-30 cursor-pointer"
                        >
                            Next ›
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlotAnalysisLanding;