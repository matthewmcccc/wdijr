import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import humanize from "../utils/humanize";
import Breadcrumbs from "../components/Breadcrumbs";
import CharacterNavigation from "../components/CharacterNavigation";
import { useContext } from "react";
import { BookContext } from "../contexts/bookContext";
import CharacterCard from "../components/CharacterCard";

const CharacterAnalysis = () => {
    const characterName = useParams<{ name: string }>().name;
    const characterNavigationDict = useContext(BookContext)?.characterNavigationDict;
    const characterData = useContext(BookContext)?.characterData?.[characterName || ""];
    const topCharacterRelationships = useContext(BookContext)?.topCharacterRelationships?.[characterName || ""] || [];

    return (
        <div className="container mx-auto px-4 py-8"> 
            <Navbar />
            <div className="">
                <Breadcrumbs items={[{ label: "Analysis", url: "/analysis" }, { label: "Character Analysis", url: "/character-analysis" }, { label: characterName ? humanize(characterName) : "Character Details" }]} />
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
                <div className="flex flex-col md:flex-row mt-8 gap-8">
                    {topCharacterRelationships.length > 0 && (
                        <div className="md:w-1/3">
                            {topCharacterRelationships.map(([relatedCharacter, _strength], index) => (
                                <CharacterCard 
                                    key={index}
                                    name={humanize(relatedCharacter)}
                                    description={``}
                                    traits={[]}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )        
}

export default CharacterAnalysis;

