import { Fragment, useContext, useEffect, useState } from "react";
import NetworkGraph from "../components/NetworkGraph";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import Dropdown from "../components/Dropdown";
import CharacterCard from "../components/CharacterCard";
import { BookContext } from "../contexts/bookContext";
import humanize from "../utils/humanize";
import { useParams } from "react-router-dom";
import axios from "axios";
import fetchNovelData from "../utils/fetchNovelData";

const CharacterAnalysisLanding = () => {
    const characterData = useContext(BookContext)?.characterData;
    const title = useContext(BookContext)?.title || "";
    const setTitle = useContext(BookContext)?.setTitle;
    const novelId = useParams<{ novelId: string }>().novelId;
    const bookContext = useContext(BookContext);
    const novelData = bookContext?.novelData;
    const setCharacterData = bookContext?.setCharacterData;
    const setNetworkData = bookContext?.setNetworkData;
    const setNovelData = bookContext?.setNovelData;
    const setAssociatedQuotes = bookContext?.setAssociatedQuotes;
    const associatedQuotes = bookContext?.associatedQuotes;

    useEffect(() => {
        const fetchCharacterData = async () => {
            if (!novelData || novelData.id !== novelId) {
                if (setNovelData && setCharacterData && setNetworkData && setTitle && setAssociatedQuotes) {
                    await fetchNovelData(novelId ?? "", setNovelData, setCharacterData, setNetworkData, setTitle, setAssociatedQuotes);
                }
            }
        };
        fetchCharacterData();
    }, [characterData, novelId, setCharacterData, setNetworkData, novelData, setNovelData, setTitle, setAssociatedQuotes, associatedQuotes]);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Character Analysis", url: `/character-analysis/${novelId}` }]} />
                <h1 className="text-5xl font-serif">Character Analysis</h1>
                <p className="font-dewi mt-4 text-gray-600 text-sm max-w-3xl">
                    Browse the analysis of {title} characters. Click on a character to see a summary, their closely related
                    characters, and their sentiment arc throughout the novel. The social network graph below shows the relationships between the characters of the novel.
                </p>
            </div>
            <hr className="border-gray-300 my-4"/>
            <div className="flex flex-col gap-12 mt-4">
                <div className="flex flex-row">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-dewi">Social Network Graph</h1>
                        <NetworkGraph 
                            key={novelId}
                            id="network-graph-1" 
                            height={400}
                            width={1250}
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
                            <Fragment key={id}>
                            {(!data.name) ? "" : null}
                                <CharacterCard 
                                    name={humanize(data.name)}
                                    description={data.description ?? "No description available."}
                                    size={"large"}
                                />
                            </Fragment>
                        ))
                    }   
                </div>
            </div>
        </div> 
    )
}

export default CharacterAnalysisLanding;