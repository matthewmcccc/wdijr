import { useContext, createContext } from "react";
import NetworkGraph from "../components/NetworkGraph";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import Dropdown from "../components/Dropdown";
import CharacterCard from "../components/CharacterCard";
import { BookContext } from "../contexts/bookContext";

const CharacterAnalysisOverview = () => {
    const characterData = useContext(BookContext)?.characterData;

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: "/analysis" }, { label: "Character Analysis" }]} />
                <h1 className="text-5xl font-serif">Character Analysis</h1>
                <p className="font-dewi mt-4 text-gray-600 text-sm max-w-3xl">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
            </div>
            <hr className="border-gray-300 my-4"/>
            <div className="flex flex-col gap-12 mt-4">
                <div className="flex flex-row">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-dewi">Social Network Graph</h1>
                        <NetworkGraph id="network-graph-1" />
                    </div>   
                </div>
                <div className="flex flex-col gap-4">
                    <div className="justify-between flex flex-row">
                        <h1 className="font-serif text-4xl">Character List</h1>
                        <Dropdown />
                    </div>
                    <hr className="border-gray-300 my-4" />
                    {
                        characterData && Object.entries(characterData).map(([name, data]) => (
                            <CharacterCard 
                                key={name} 
                                name={name} 
                                description={data.description} 
                                traits={data.traits} 
                            />
                        ))
                    }   
                </div>
            </div>
        </div> 
    )
}

export default CharacterAnalysisOverview;