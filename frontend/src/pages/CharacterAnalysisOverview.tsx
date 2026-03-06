import { useContext, createContext } from "react";
import NetworkGraph from "../components/NetworkGraph";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import Dropdown from "../components/Dropdown";
import CharacterCard from "../components/CharacterCard";
import { BookContext } from "../contexts/bookContext";
import humanize from "../utils/humanize";

const CharacterAnalysisLanding = () => {
    const characterData = useContext(BookContext)?.characterData;
    const characterDescriptions = useContext(BookContext)?.summaries;

    console.log("Character data in CharacterAnalysisLanding:", characterData);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            {console.log(characterDescriptions)}
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: "/analysis" }, { label: "Character Analysis" }]} />
                <h1 className="text-5xl font-serif">Character Analysis</h1>
                <p className="font-dewi mt-4 text-gray-600 text-sm max-w-3xl">
                    Browse the analyis of Wuthering Heights characters. Click on a character to see a summary, their closely related
                    characters, and their sentiment arc throughout the novel. The social network graph below shows the relationships between the characters of the novel.
                </p>
            </div>
            <hr className="border-gray-300 my-4"/>
            <div className="flex flex-col gap-12 mt-4">
                <div className="flex flex-row">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-dewi">Social Network Graph</h1>
                        <NetworkGraph 
                            id="network-graph-1" 
                            height={400}
                            width={1500}
                        />
                    </div>   
                </div>
                <div className="flex flex-col gap-4">
                    <div className="justify-between flex flex-row">
                        <h1 className="font-serif text-4xl">Characters</h1>
                        <Dropdown />
                    </div>
                    <hr className="border-gray-300 my-4" />
                    {
                        characterData && Object.entries(characterData).map(([id, data]) => (
                            <>
                            {(!data.last_name) ? "" : null}
                                <CharacterCard 
                                    key={id} 
                                    name={humanize(data.name)}
                                    description={characterDescriptions?.[humanize(data.name)]?.description ?? "No description available."}
                                    size={"large"}
                                />
                            </>
                        ))
                    }   
                </div>
            </div>
        </div> 
    )
}

export default CharacterAnalysisLanding;