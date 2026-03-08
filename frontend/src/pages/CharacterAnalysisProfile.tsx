import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import humanize from "../utils/humanize";
import Breadcrumbs from "../components/Breadcrumbs";
import CharacterNavigation from "../components/CharacterNavigation";
import { use, useContext, useEffect } from "react";
import { BookContext } from "../contexts/bookContext";
import CharacterCard from "../components/CharacterCard";
import SentimentAreaChart from "../components/SentimentAreaChart";
import NetworkGraph from "../components/NetworkGraph";

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
    const characterNavigationDict = useContext(BookContext)?.characterNavigationDict;
    const characterData = useContext(BookContext)?.characterData?.[humanize(characterName ?? "").toLowerCase()] || "";
    const topCharacterRelationships = useContext(BookContext)?.topCharacterRelationships?.[humanize(characterName ?? "").toLowerCase() || ""] || [];
    const topCharacterQuote = useContext(BookContext)?.topCharacterQuotes?.[humanize(characterName ?? "").toLowerCase() || ""] || [];
    const attributedQuotes = useContext(BookContext)?.attributedQuotes?.filter(q => q.speaker.toLowerCase() === humanize(characterName ?? "").toLowerCase()) || [];
    const setNetworkData = useContext(BookContext)?.setNetworkData;
    const novelId = useParams<{ novelId: string }>().novelId;

    useEffect(() => {
        
    }, []);

    return (
        <div className="container mx-auto px-4 py-8"> 
            <Navbar />
            <div className="">
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Character Analysis", url: `/character-analysis/${novelId}` }, { label: characterName ? humanize(characterName) : "Character Details" }]} />
                <div className="font-serif text-center justify-between flex flex-row items-center">
                    <div className="flex-1 flex justify-left">
                        <CharacterNavigation 
                            name={characterNavigationDict ? (characterNavigationDict[humanize(characterName ?? "")]?.left ?? "") : ""}
                            position={characterNavigationDict && characterName && characterNavigationDict[humanize(characterName)]?.left ? "left" : "none"}
                        />
                    </div>
                    <h1 className="text-4xl flex-1 text-center">
                        {characterName ? humanize(characterName) : "Character Analysis"}
                        
                    </h1>
                    <div className="flex-1 flex justify-end">
                        <CharacterNavigation 
                            name={characterNavigationDict ? (characterNavigationDict[humanize(characterName ?? "")]?.right ?? "") : ""}
                            position={characterNavigationDict && characterName && characterNavigationDict[humanize(characterName)]?.right ? "right" : "none"}
                        />
                    </div>
                </div>
                {topCharacterQuote.length > 0 && (
                    <div className="text-sm mt-2 italic text-gray-600 max-w-4xl font-serif mx-auto text-center">
                        "...{topCharacterQuote[0].quote}..."
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
                            {topCharacterRelationships.length > 0 && (
                                <div className="md:w-1/2">
                                    <div className="font-serif text-lg">
                                        Closely Related Characters
                                    </div>
                                    <hr className="my-2 text-gray-300"/>
                                    {topCharacterRelationships.map(([relatedCharacter, _strength], index) => (
                                        <CharacterCard 
                                            key={index}
                                            name={humanize(relatedCharacter)}
                                            description={characterData?.description || ""}
                                            traits={characterData?.traits || []}
                                            size={"small"}
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
                                data={smooth(attributedQuotes.map(q => q.sentiment))}
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
                    </div>
                </div>
            </div>
        </div>
    )        
}

export default CharacterAnalysisProfile;

