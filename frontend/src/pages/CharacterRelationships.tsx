import { useParams } from "react-router-dom";
import { BookContext } from "../contexts/bookContext";
import { useContext } from "react";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";

export const CharacterRelationships = () => {
    const { novelId } = useParams();
    const { characterData } = useContext(BookContext);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Miscellany", url: `/miscellany/${novelId}` }, { label: "Character Relationships", url: `/character-relationships/${novelId}` }]} />
                <h1 className="text-5xl font-serif mb-4">Character Relationships Over Time</h1>
                <p className="text-md text-gray-700">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </div>
            <hr className="my-4 border-gray-300" />
            <div className="border border-gray-300 rounded-lg p-4">
                
            </div>
        </div>
    )
}

export default CharacterRelationships;