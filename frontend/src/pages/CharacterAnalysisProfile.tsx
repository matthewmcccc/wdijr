import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import humanize from "../utils/humanize";
import Breadcrumbs from "../components/Breadcrumbs";
import CharacterNavigation from "../components/CharacterNavigation";
import { useState, useContext, useEffect } from "react";
import { BookContext } from "../contexts/bookContext";
import CharacterCard from "../components/CharacterCard";
import SentimentAreaChart from "../components/SentimentAreaChart";
import NetworkGraph from "../components/NetworkGraph";
import fetchNovelData from "../utils/fetchNovelData";
import cumulativeSentiment from "../utils/cumulativeSentiment";
import CharacterSentimentChart from "../components/CharacterSentimentChart";

const smooth = (data: number[], windowSize: number = 10): number[] => {
    return data.map((_, i) => {
        const start = Math.max(0, i - Math.floor(windowSize / 2));
        const end = Math.min(data.length, i + Math.floor(windowSize / 2) + 1);
        const window = data.slice(start, end);
        return window.reduce((sum, v) => sum + v, 0) / window.length;
    });
};


const CharacterAnalysisProfile = () => {
    const characterName = useParams<{ name: string }>().name;
    const allCharacterData = useContext(BookContext)?.characterData;
    const characterData = Object.values(allCharacterData ?? {})
        .find(c => c.name.toLowerCase() === humanize(characterName ?? "").toLowerCase());
    const characterNavigationDict = allCharacterData ? Object.fromEntries(Object.values(allCharacterData).map(c => [humanize(c.name).toLowerCase(), {
        left: Object.values(allCharacterData).find(other => other.name !== c.name && other.name.toLowerCase() < c.name.toLowerCase())?.name || "",
        right: Object.values(allCharacterData).find(other => other.name !== c.name && other.name.toLowerCase() > c.name.toLowerCase())?.name || "",
    }])) : null;
    const setNetworkData = useContext(BookContext)?.setNetworkData;
    const novelId = useParams<{ novelId: string }>().novelId;
    const novelData = useContext(BookContext)?.novelData;
    const setNovelData = useContext(BookContext)?.setNovelData;
    const setCharacterData = useContext(BookContext)?.setCharacterData;
    const setTitle = useContext(BookContext)?.setTitle;
    const topRelationships = (characterData as any)?.["top_relationships"] || [];
    const topQuote = characterData ? (characterData as any).top_quote : null;
    const quoteData = useContext(BookContext)?.quoteData;
    const setCharacterSentimentValues = useContext(BookContext)?.setCharacterSentimentValues;
    const characterSentimentValues = useContext(BookContext)?.characterSentimentValues;
    const setQuoteData = useContext(BookContext)?.setQuoteData;
    const setPlotSummaries = useContext(BookContext)?.setPlotSummaries;
    const setSentimentValues = useContext(BookContext)?.setSentimentValues;
    const setInflectionPoints = useContext(BookContext)?.setInflectionPoints;
    const setCoverUrl = useContext(BookContext)?.setCoverUrl;
    const currentChar = humanize(characterName ?? "").toLowerCase();
    const targetOptions = Object.keys(characterSentimentValues?.[currentChar] || {})
    .filter(t => (characterSentimentValues?.[currentChar]?.[t]?.length ?? 0) > 2);
    const [selectedTarget, setSelectedTarget] = useState<string>("");

    console.log(`topRelationships: ${JSON.stringify(topRelationships)}`);  

    const cum_sen = cumulativeSentiment(currentChar, characterSentimentValues || {});
    console.log(cum_sen);

    const sortedCharacters = Object.values(allCharacterData ?? {})
    .map(c => c.name)

    const currentIndex = sortedCharacters.findIndex(
        n => n.toLowerCase() === currentChar
    );

    const leftCharacter = currentIndex > 0 ? sortedCharacters[currentIndex - 1] : "";
    const rightCharacter = currentIndex < sortedCharacters.length - 1 ? sortedCharacters[currentIndex + 1] : "";

    useEffect(() => {
        const fetchCharacterData = async () => {
            if (!novelData || novelData.id !== novelId) {
                if (setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setCharacterSentimentValues) {
                    await fetchNovelData(novelId, setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues);
                }
            }
        };
        fetchCharacterData();
    }, [novelId]);

    useEffect(() => {
        if (targetOptions.length > 0 && !selectedTarget) {
            setSelectedTarget(targetOptions[0]);
        }
    }, [targetOptions]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    const characterQuotes = quoteData
        ? Object.values(quoteData).filter((q: any) => q.speaker?.toLowerCase() === humanize(characterName ?? "").toLowerCase())
        : [];
        
    return (
        <div className="container mx-auto px-4 py-8"> 
            <Navbar />
            <div className="">
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Character Analysis", url: `/character-analysis/${novelId}` }, { label: characterName ? humanize(characterName) : "Character Details" }]} />
                <div className="font-serif text-center justify-between flex flex-row items-center">
                    <div className="flex-1 flex justify-left">
                        <CharacterNavigation 
                            name={humanize(leftCharacter)}
                            position={leftCharacter ? "left" : "none"}
                        />
                    </div>
                    <h1 className="text-4xl flex-1 text-center">
                        {characterName ? humanize(characterName) : "Character Analysis"}
                        
                    </h1>
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
                <div className="flex flex-col justify-between mt-8">
                    <div className="font-serif flex-1 text-2xl">
                        Character Summary
                    </div>
                    <div className="flex-1 flex flex-row mt-8">
                        <div className="flex flex-1">
                            <p className="font-serif text-gray-900">
                                {characterData?.summary || "No summary available."}
                            </p>
                        </div>
                        <div className="justify-end flex flex-1">
                            {topRelationships.length > 0 && (
                                <div className="md:w-1/2">
                                    <div className="font-serif text-lg">
                                        Closely Related Characters
                                    </div>
                                    <hr className="my-2 text-gray-300"/>
                                    {topRelationships.map(([relatedCharacter, _strength, sentiment], index) => (
                                        <CharacterCard 
                                            key={index}
                                            name={humanize(relatedCharacter)}
                                            description={""}
                                            traits={characterData?.traits || []}
                                            size={"small"}
                                            sentiment={sentiment}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="justify-between  flex flex-row mt-12">
                        <div>
                            <h1 className="font-dewi text-md mb-4">
                                {characterName ? `${humanize(characterName)}'s Sentiment Over Time` : "Sentiment Over Time"}
                            </h1>
                            <SentimentAreaChart 
                                data={smooth(characterQuotes.map(q => q.sentiment))}
                                width={550}
                                height={350}
                            />
                        </div>
                        <div>
                            <h1 className="font-dewi text-md mb-4">
                                {characterName ? `${humanize(characterName)}'s Social Network` : "Social Network"}
                            </h1>
                            <NetworkGraph 
                                    key={characterName}
                                    id={`network-${characterName}`} 
                                    filterCharacter={characterName} 
                                    height={350}
                                    width={550}
                                />
                        </div>
                        {/* <div>
                            <h1 className="font-dewi text-md mb-4">
                                Character-to-Character Sentiment
                            </h1>
                            <select 
                                value={selectedTarget}
                                onChange={(e) => setSelectedTarget(e.target.value)}
                                className="mb-4 border border-gray-300 rounded px-2 py-1 font-serif text-sm"
                            >
                                {targetOptions.map(t => (
                                    <option key={t} value={t}>{humanize(t)}</option>
                                ))}
                                        </select>
                                        {selectedTarget && (
                                            <CharacterSentimentChart
                                                speakerName={humanize(currentChar)}
                                                targetName={humanize(selectedTarget)}
                                                speakerToTarget={characterSentimentValues?.[currentChar]?.[selectedTarget] || []}
                                                targetToSpeaker={characterSentimentValues?.[selectedTarget]?.[currentChar] || []}
                                                width={550}
                                                height={350}
                                            />
                                        )}
                         </div> */}
                    </div>
                </div>
            </div>
        </div>
    )        
}

export default CharacterAnalysisProfile;

