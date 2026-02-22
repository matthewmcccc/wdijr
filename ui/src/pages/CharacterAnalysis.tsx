import NetworkGraph from "./NetworkGraph";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import Dropdown from "../components/Dropdown";

const characterData = {
    "Heathcliff": {
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "traits": ["Brooding", "Passionate", "Vengeful"],
    },
    "Catherine Earnshaw": {
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "traits": ["Headstrong", "Impulsive", "Loyal"],
    },
    "Edgar Linton": {
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "traits": ["Refined", "Gentle", "Protective"],
    },
    "Isabella Linton": {
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "traits": ["Naive", "Romantic", "Resilient"],
    },
    "Hindley Earnshaw": {
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "traits": ["Jealous", "Resentful", "Tragic"],
    },
}

const CharacterAnalysis = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: "/analysis" }, { label: "Character Analysis" }]} />
                <h1 className="text-5xl font-serif">Character Analysis</h1>
                <p className="font-dewi mt-4 text-gray-600 text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </div>
            <hr className="border-gray-300 my-4"/>
            <div className="flex flex-col gap-12 mt-4">
                <div className="flex flex-row gap-12 justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-dewi">Social Network Graph</h1>
                        <NetworkGraph id="network-graph-1" />
                    </div>   
                    <div className="flex flex-col gap-2">
                        <h1 className="font-dewi">Co-occurrence Graph</h1>
                        <NetworkGraph id="network-graph-2" />
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
                            <div key={name} className="mb-8 p-6 border rounded-lg shadow-md">
                                <h2 className="text-3xl font-serif mb-4">{name}</h2>
                                <p className="mb-4">{data.description}</p>
                                <div>
                                    <ul className="list-none list-inside flex flex-row gap-4">
                                        {data.traits.map((trait, index) => (
                                            <li className="bg-gray-200 rounded-lg px-2 text-sm text-black" key={index}>{trait}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))
                    }   
                </div>
            </div>
        </div> 
    )
}

export default CharacterAnalysis;