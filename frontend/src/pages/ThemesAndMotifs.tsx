import { useContext, useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import Navbar from "../components/Navbar";
import fetchNovelData from "../utils/fetchNovelData";
import { BookContext } from "../contexts/bookContext";
import { useParams } from "react-router-dom";
import MotifTreeGraph from "../components/MotifTreeGraph";
import TooltipComponent from "../components/Tooltip";
import MotifCard from "../components/MotifCard";
import { scaleOrdinal, schemeTableau10 } from "d3";
import useNovelData from "../hooks/useNovelData";

const ThemesAndMotifs = () => {
    const title = "Themes and Motifs";
    const { novelId } = useParams<{ novelId: string }>();
    const ctx = useNovelData(novelId);

    const bookTitle = ctx?.title;
    const motifData = ctx?.motifData;

    const color = scaleOrdinal(schemeTableau10);

    useEffect(() => {
        document.title = `${title}`;
    })

    const hasMotifData = Array.isArray(motifData) && motifData.length > 0;
    const treeMapData = hasMotifData
        ? Object.fromEntries(motifData.map(g => [g.category, g.motifs]))
        : null;

    const sortedMotifData = hasMotifData ? [...motifData].sort((a, b) => b.motifs.length - a.motifs.length) : [];


    return ( 
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Miscellany", url: `/miscellany/${novelId}` }, { label: "Themes and Motifs", url: `/themes-and-motifs/${novelId}` }]} />
                <h1 className="text-4xl text-center md:text-left md:text-5xl font-serif mb-4">Themes and Motifs</h1>
                <p className="md:text-lg mb-4 text-gray-700 text-center md:text-left">Explore the major themes and motifs present in the novel, and how they contribute to the overall narrative.</p>
            </div>
            <hr className="border-gray-300 mb-4" />
            {hasMotifData ? ( 
                <>
                    <div className="border border-gray-300 rounded-md mb-8 shadow-md">
                        <div className="flex items-center justify-between px-4 py-2">
                            <h1></h1>
                            <h1 className="text-xl font-serif my-4 text-center">{bookTitle} | Motifs</h1>
                            <TooltipComponent title={"Themes and Motifs"} content={"Motifs are recurring elements, symbols, or ideas that appear throughout a novel. Click on a parent motif to zoom in and explore its sub-motifs. Click on the parent motif again to zoom back out."} />
                        </div>
                        <hr className="w-1/2 mx-auto border-gray-300" />
                        <MotifTreeGraph motifData={treeMapData} />
                    </div>
                </>
            ) : (
                <p className="text-lg text-gray-700">No motifs available.</p>
            )}
            <hr className="border-gray-300 mb-4" />
            <h1 className="text-3xl font-serif mb-8">Overview</h1>
            <div className="flex flex-wrap justify-center gap-4">
                {hasMotifData && sortedMotifData.map(group => {
                    const groupColor = color(group.category);
                    return (
                        <div key={group.category} className={`w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] flex flex-col`} style={{ borderColor: groupColor, borderLeft: `2px solid ${groupColor}`, borderRadius: "1rem"}}>
                            <MotifCard 
                                title={group.category} 
                                description={group.summary} 
                                count={group.motifs.length}
                                motifs={group.motifs}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ThemesAndMotifs;