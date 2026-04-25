import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import useNovelData from "../hooks/useNovelData";
import CharacterOccurencesHeatmap from "../components/CharacterOccurencesHeatmap";
import TooltipComponent from "../components/Tooltip";

const CharacterOccurences = () => {
    const novelId = useParams<{ novelId: string }>().novelId;
    const ctx = useNovelData(novelId);

    const characterOccurenceData = ctx?.chapterOccurenceData;

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Miscellany", url: `/miscellany/${novelId}` }, { label: "Character Occurences" }]} />
                <h1 className="text-5xl font-serif mb-4">Character Occurences</h1>
                <p className="text-md text-gray-700">
                    A collection of additional analyses and insights about the novel that don't fit into the other categories, but are still fascinating to explore.
                </p>
            </div>
            <hr className="border-gray-300 my-4" />
            <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <h1></h1>
                    <h1 className="text-center font-serif text-xl">Character Occurences by Chapter</h1>
                    <TooltipComponent title="Character Occurences by Chapter" content={"This heatmap shows the number of times each character appears in each chapter."} />
                </div>
                <hr className="border-gray-300 my-4 w-2/3 mx-auto" />
                <CharacterOccurencesHeatmap data={characterOccurenceData} />
            </div>
        </div>
    );
};

export default CharacterOccurences;