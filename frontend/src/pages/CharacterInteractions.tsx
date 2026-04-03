import { BookContext } from "../contexts/bookContext";
import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import fetchNovelData from "../utils/fetchNovelData";
import CharacterSelectComponent from "../components/CharacterSelectComponent";
import InteractionsLineChart from "../components/InteractionsLineChart";
import humanize from "../utils/humanize";
import CharacterInteractionCharacterCard from "../components/CharacterInteractionCharacterCard";

export const CharacterInteractions = () => {
    const { novelId } = useParams();
    const characterData = useContext(BookContext)?.characterData;
    const setNovelData = useContext(BookContext)?.setNovelData;
    const setCharacterData = useContext(BookContext)?.setCharacterData;
    const setNetworkData = useContext(BookContext)?.setNetworkData;
    const setTitle = useContext(BookContext)?.setTitle;
    const setQuoteData = useContext(BookContext)?.setQuoteData;
    const setPlotSummaries = useContext(BookContext)?.setPlotSummaries;
    const setSentimentValues = useContext(BookContext)?.setSentimentValues;
    const setInflectionPoints = useContext(BookContext)?.setInflectionPoints;
    const setCoverUrl = useContext(BookContext)?.setCoverUrl;
    const setCharacterSentimentValues = useContext(BookContext)?.setCharacterSentimentValues;
    const setChapterData = useContext(BookContext)?.setChapterData;
    const setChapterNetworkData = useContext(BookContext)?.setChapterNetworkData;
    const setCooccurrenceNetworkData = useContext(BookContext)?.setCooccurrenceNetworkData;
    const setAuthorData = useContext(BookContext)?.setAuthorData;
    const setMotifData = useContext(BookContext)?.setMotifData;
    const quoteData = useContext(BookContext)?.quoteData;
    const lexicalRichness = useContext(BookContext)?.lexicalRichness;
    const setLexicalRichness = useContext(BookContext)?.setLexicalRichness;
    const setChapterCooccurrenceData = useContext(BookContext)?.setChapterCooccurrenceData;
    const chapterCooccurrenceData = useContext(BookContext)?.chapterCooccurrenceData;
    const title = useContext(BookContext)?.title || "";
    const navigate = useNavigate();

    const characters = characterData ? characterData.map((c: any) => c.name) : [];

    const [charA, setCharA] = useState<string | null>(characters.length > 0 ? characters[0] : null);
    const [charB, setCharB] = useState<string | null>(characters.length > 1 ? characters[1] : null);

    const charAData = characterData?.find((c: any) => c.name === charA);
    const charBData = characterData?.find((c: any) => c.name === charB);

    console.log(charAData, charBData)

    const selectedPair = ([charA, charB]).sort().join("--");
    const chartData = chapterCooccurrenceData ? Object.entries(chapterCooccurrenceData).map(([chapterIdx, pairs]) => ({
        chapter: Number(chapterIdx) + 1,
        interactions: pairs[selectedPair] ?? 0
    })) : [];

    useEffect(() => {
        const fetchData = async () => {
            if (novelId && setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues && setChapterData && setChapterNetworkData && setCooccurrenceNetworkData && setAuthorData && setMotifData && setLexicalRichness && setChapterCooccurrenceData) {
                await fetchNovelData(novelId, setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData, setAuthorData, setMotifData, setLexicalRichness, setChapterCooccurrenceData);
            }
        };
        fetchData();
    }, [!quoteData, !lexicalRichness, !chapterCooccurrenceData]);

    useEffect(() => {
        document.title = `Character Interactions | ${title}`;
    }, [title]);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Miscellany", url: `/miscellany/${novelId}` }, { label: "Character Interactions", url: `/character-interactions/${novelId}` }]} />
                <h1 className="text-5xl font-serif mb-4">Character Interactions Over Time</h1>
                <p className="text-md text-gray-700">
                    Explore how interactions between characters evolve throughout the novel. Select any two characters to see a chapter-by-chapter breakdown of their interactions, visualized in the line chart below.
                </p>
            </div>
            <hr className="my-4 border-gray-300" />
            <div className="flex flex-col gap-6">
                <div className="border border-gray-300 rounded-lg p-4 shadow-md">
                    <div className="flex flex-row gap-4 border border-gray-100 w-fit p-2 mb-4 rounded-xl items-center mx-auto shadow-xs">
                        <div className="border border-gray-300 rounded-lg px-3 py-[2px]">
                            <CharacterSelectComponent characters={characters.filter(c => c !== charB)} selectedCharacter={charA} setSelectedCharacter={setCharA} />
                        </div>
                        <span className="text-gray-500 text-lg">&</span>
                        <div className="border border-gray-300 rounded-lg px-3 py-[2px]">
                            <CharacterSelectComponent characters={characters.filter(c => c !== charA)} selectedCharacter={charB} setSelectedCharacter={setCharB} />
                        </div>
                    </div>
                    <InteractionsLineChart data={chartData} />
                   
                </div>
            </div>
             {charA && charB ? (
                <div className="">
                    <hr className="border-gray-300 mb-4 w-full mt-8"/>
                    <div className="flex flex-row gap-6 mt-8">
                        <div onClick={() => {navigate(`/character/${novelId}/${charAData?.name}`)}} className="flex-1">
                            <CharacterInteractionCharacterCard
                                character={humanize(charAData?.name)}
                                summary={charAData?.description}
                            />
                        </div>
                        <div onClick={() => {navigate(`/character/${novelId}/${charBData?.name}`)}} className="flex-1">
                            <CharacterInteractionCharacterCard
                                character={humanize(charBData?.name)}
                                summary={charBData?.description}
                            />
                        </div>
                    </div>
                </div>
        ) : null}
        </div>
    )
}

export default CharacterInteractions;