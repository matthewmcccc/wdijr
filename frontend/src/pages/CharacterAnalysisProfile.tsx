import Navbar from "../components/Navbar";
import useContainerSize from "../hooks/useContainerSize";
import { useParams } from "react-router-dom";
import humanize from "../utils/humanize";
import Breadcrumbs from "../components/Breadcrumbs";
import CharacterNavigation from "../components/CharacterNavigation";
import { useEffect } from "react";
import useNovelData from "../hooks/useNovelData";
import SentimentAreaChart from "../components/SentimentAreaChart";
import NetworkGraph from "../components/NetworkGraph";
import RelatedCharacterCard from "../components/RelatedCharacterCard";
import TooltipComponent from "../components/Tooltip";
import { Loader2 } from "lucide-react";

const CharacterAnalysisProfile = () => {
    const characterName = useParams<{ name: string }>().name;
    const novelId = useParams<{ novelId: string }>().novelId;
    const ctx = useNovelData(novelId);

    const allCharacterData = ctx?.characterData;
    const quoteData = ctx?.quoteData;
    const chapterData = ctx?.chapterData || [];

    const characterData = Object.values(allCharacterData ?? {})
        .find(c => c.name.toLowerCase() === humanize(characterName ?? "").toLowerCase());
    const topRelationships = (characterData as any)?.["top_relationships"] || [];
    const topQuote = characterData ? (characterData as any).top_quote : null;
    const currentChar = humanize(characterName ?? "").toLowerCase();

    const { containerRef: leftChartRef, width: leftChartWidth } = useContainerSize();
    const { containerRef: rightChartRef, width: rightChartWidth } = useContainerSize();

    const sortedCharacters = Object.values(allCharacterData ?? {}).map(c => c.name);
    const currentIndex = sortedCharacters.findIndex(n => n.toLowerCase() === currentChar);
    const leftCharacter = currentIndex > 0 ? sortedCharacters[currentIndex - 1] : "";
    const rightCharacter = currentIndex < sortedCharacters.length - 1 ? sortedCharacters[currentIndex + 1] : "";

    const sentimentChartWidth = leftChartWidth > 0 ? leftChartWidth : 600;
    const networkChartWidth = rightChartWidth > 0 ? rightChartWidth : 600;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (characterName) {
            document.title = `${humanize(characterName)} | Character Analysis`;
        }
    }, [characterName]);

    const characterQuotes = quoteData
        ? Object.values(quoteData).filter((q: any) => q.speaker?.toLowerCase() === humanize(characterName ?? "").toLowerCase())
        : [];

    if (!characterData || !quoteData) {
        return (
            <div>
                <Navbar />
                <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
                    <h1 className="text-3xl shimmer font-serif text-center">Loading...</h1>
                    <Loader2 className="animate-spin h-7 w-7 mx-auto my-6" />
                </div>
            </div>
        );
    }

    const totalChapters = chapterData.length || 1;
    const chapterGroups: Record<number, any[]> = {};
    characterQuotes.forEach((q: any) => {
        const chapterNum = q.chapter_number;
        if (!chapterGroups[chapterNum]) chapterGroups[chapterNum] = [];
        chapterGroups[chapterNum].push(q);
    });

    const positionedSentiment: { x: number; sentiment: number }[] = [];
    Object.entries(chapterGroups).forEach(([ch, quotes]) => {
        const chNum = Number(ch);
        const chStart = chNum / totalChapters;
        const chEnd = (chNum + 1) / totalChapters;
        quotes.forEach((q, i) => {
            const x = chStart + (i / quotes.length) * (chEnd - chStart);
            positionedSentiment.push({ x, sentiment: q.sentiment });
        });
    });
    positionedSentiment.sort((a, b) => a.x - b.x);

    const smoothPositioned = (data: { x: number; sentiment: number }[], windowSize: number = 10) => {
        return data.map((d, i) => {
            const start = Math.max(0, i - Math.floor(windowSize / 2));
            const end = Math.min(data.length, i + Math.floor(windowSize / 2) + 1);
            const window = data.slice(start, end);
            const avg = window.reduce((sum, v) => sum + v.sentiment, 0) / window.length;
            return { x: d.x, sentiment: avg };
        });
    };

    const notableQuotes = characterQuotes.filter((q: any) => q.content.length < 150).sort((a: any, b: any) => Math.abs(b.sentiment) - Math.abs(a.sentiment)).slice(0, 5);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Character Analysis", url: `/character-analysis/${novelId}` }, { label: characterName ? humanize(characterName) : "Character Details" }]} />
                <div className="font-serif text-center justify-between flex flex-row items-center">
                    <div className="flex-1 flex justify-left">
                        <CharacterNavigation
                            name={humanize(leftCharacter)}
                            position={leftCharacter ? "left" : "none"}
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl flex-1 text-center">
                            {characterName ? humanize(characterName) : "Character Analysis"}
                        </h1>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <CharacterNavigation
                            name={humanize(rightCharacter)}
                            position={rightCharacter ? "right" : "none"}
                        />
                    </div>
                </div>
                {topQuote && (
                    <div className="text-sm mt-2 italic text-gray-600 max-w-4xl font-serif mx-auto text-center">
                        "...{topQuote}..."
                    </div>
                )}
                <div className="flex flex-row gap-24 mt-8">
                    <div className="flex flex-col gap-4 flex-[2]">
                        <div className="font-serif text-2xl">Character Summary</div>
                        <hr className="my-4 text-gray-300 w-1/2"/>
                        <div className="font-serif text-gray-900 whitespace-pre-wrap">
                            {characterData?.summary?.split('\n\n').map((para, i) => (
                                <p key={i} className="font-serif text-gray-900 mb-4">{para}</p>
                            )) || "No summary available."}
                        </div>
                    </div>
                    <div className="flex-1 flex-col min-w-[280px]">
                        {topRelationships.length > 0 && (
                            <div className="border border-gray-300 rounded-lg p-4 shadow-md">
                                <div className="flex justify-between items-center">
                                    <h1></h1>
                                    <h1 className="font-serif text-lg text-center">Closely Related Characters</h1>
                                    <TooltipComponent
                                        title={"Closely Related Characters"}
                                        content={"These characters have the strongest relationships with the current character based on their interactions in the novel. \n\n The strength of the relationship is indicated by the number of exchanges they have, and the sentiment gives insight into whether their interactions are generally positive, negative, or neutral."}
                                    />
                                </div>
                                <hr className="my-4 text-gray-300"/>
                                {topRelationships.map(([relatedCharacter, strength, sentiment]) => (
                                    <RelatedCharacterCard
                                        key={relatedCharacter}
                                        name={relatedCharacter}
                                        quoteCount={strength}
                                        sentiment={sentiment}
                                        image_url={undefined}
                                    />
                                ))}
                            </div>
                        )}
                        <div className="mt-16 border border-gray-300 rounded-lg p-4 shadow-md">
                            <div className="flex justify-between items-center">
                                <h1></h1>
                                <h1 className="font-serif text-center text-lg mt-2">Notable Quotes</h1>
                                <TooltipComponent
                                    title={"Notable Quotes"}
                                    content={"These quotes are selected based on their absolute sentiment strength. \n\n The sentiment of each quote is indicated by the color of the border: green for positive, red for negative."}
                                />
                            </div>
                            <hr className="my-4 text-gray-300"/>
                            <div className="max-h-[400px] overflow-y-auto pr-2">
                                {notableQuotes.length === 0 ? (
                                    <p className="text-gray-600 font-serif text-sm italic text-center">
                                        No notable quotes found for this character.
                                    </p>
                                ) : (
                                    notableQuotes.map((q: any, index: number) => (
                                        <div key={index} className={`mb-4 p-3 border border-gray-200 rounded-lg border-l-4 ${q.sentiment >= 0 ? "border-l-green-500" : "border-l-red-500"}`}>
                                            <p className="italic text-sm text-gray-800">"{q.content}"</p>
                                            <p className="text-sm text-gray-500 mt-1">{chapterData[q.chapter_number]?.title}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="border-gray-300 w-1/2 mx-auto my-12" />
                <div className="grid grid-cols-2 gap-8 mt-12">
                    <div ref={leftChartRef} className="overflow-hidden border border-gray-300 rounded-lg p-4 shadow-md">
                        <h1 className="font-serif text-md mb-4 text-center text-lg">
                            {characterName ? `${humanize(characterName)}'s Sentiment Over Time` : "Sentiment Over Time"}
                        </h1>
                        <hr className="border-gray-300 w-1/2 mx-auto" />
                        {positionedSentiment.length === 0 ? (
                            <p className="text-gray-600 font-serif text-sm italic text-center mt-4">
                                No sentiment data available for this character.
                            </p>
                        ) : (
                            <SentimentAreaChart
                                data={smoothPositioned(positionedSentiment)}
                                width={sentimentChartWidth}
                                height={300}
                            />
                        )}
                    </div>
                    <div ref={rightChartRef} className="overflow-hidden border border-gray-300 rounded-lg p-4 shadow-md">
                        <h1 className="font-serif text-md mb-4 text-center text-lg">
                            {characterName ? `${humanize(characterName)}'s Conversational Network` : "Conversational Network"}
                        </h1>
                        <hr className="border-gray-300 w-1/2 mx-auto" />
                        {positionedSentiment.length === 0 ? (
                            <p className="text-gray-600 font-serif text-sm italic text-center mt-4">
                                No conversational network data available for this character.
                            </p>
                        ) : (
                            <NetworkGraph
                                key={characterName}
                                id={`network-${characterName}`}
                                filterCharacter={characterName}
                                height={300}
                                width={networkChartWidth}
                                showLegend={false}
                                isFiltered={true}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterAnalysisProfile;