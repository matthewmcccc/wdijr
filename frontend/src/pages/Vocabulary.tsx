import { useContext, useEffect } from "react";
import { BookContext } from "../contexts/bookContext";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import { useParams } from "react-router-dom";
import VocabularyBarChart from "../components/VocabBarChart";
import fetchNovelData from "../utils/fetchNovelData";
import humanize from "../utils/humanize";
import TooltipComponent from "../components/Tooltip";


const Vocabulary = () => {
    const novelId = useParams<{ novelId: string }>().novelId;
    const bookTitle = useContext(BookContext)?.title || "Novel";

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
    const setTopCharacterRelationships = useContext(BookContext)?.setTopCharacterRelationships;
    const quoteData = useContext(BookContext)?.quoteData;
    const lexicalRichness = useContext(BookContext)?.lexicalRichness;
    const setLexicalRichness = useContext(BookContext)?.setLexicalRichness;

    const pickQuote = (quotes: any[], speaker: string) => {
        return quotes
            .filter((q: any) => q.speaker === speaker && q.content.split(' ').length > 15)
            .sort((a: any, b: any) => b.content.split(' ').length - a.content.split(' ').length)
            [0] ?? null;
    };

    const lexicalRichnessData = Object.entries(lexicalRichness ?? {}).map(([character, confidence]) => ({ character, confidence }))

    let mostTalkativeCharacter = null;
    let mostDiverseCharacter = null;
    let leastDiverseCharacter = null;
    let mostDiverseCharacterQuote = null;
    let leastDiverseCharacterQuote = null;

    if (lexicalRichnessData.length > 0) {
        mostTalkativeCharacter = lexicalRichnessData.reduce((prev, current) => (current.confidence.word_count > prev.confidence.word_count ? current : prev));
        mostDiverseCharacter = lexicalRichnessData.reduce((prev, current) => (current.confidence.mattr > prev.confidence.mattr && current.confidence.word_count > 100 ? current : prev));
        leastDiverseCharacter = lexicalRichnessData.reduce((prev, current) => (current.confidence.mattr < prev.confidence.mattr && current.confidence.word_count > 100 ? current : prev));
    }

    if (quoteData && mostDiverseCharacter && leastDiverseCharacter) {
        mostDiverseCharacterQuote = pickQuote(quoteData, mostDiverseCharacter?.character);
        leastDiverseCharacterQuote = pickQuote(quoteData, leastDiverseCharacter?.character);
    }

    const characterWordList = quoteData ? Object.values(quoteData).flat().reduce((acc: Record<string, string[]>, quote: any) => {
        if (!acc[quote.speaker]) {
            acc[quote.speaker] = [];
        }
        acc[quote.speaker].push(...quote.content.split(' '));
        return acc;
    }, {}) : {};

    const uniqueWordsByCharacter = Object.entries(characterWordList).reduce((acc: Record<string, Set<string>>, [character, words]) => {
        acc[character] = new Set(words);
        return acc;
    }, {});

    const exclusiveWords = (character: string): string[] => {
        const mine = uniqueWordsByCharacter[character];
        if (!mine) return [];
        const others = new Set<string>();
        for (const [name, words] of Object.entries(uniqueWordsByCharacter)) {
            if (name !== character) words.forEach(w => others.add(w));
        }
        return [...mine]
            .filter(w => !others.has(w))
            .filter(w => w.length > 3)                    
            .map(w => w.replace(/[.,!?;:"'()]/g, ''))  
            .filter(w => w.length > 0);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (setNovelData && setCharacterData && setNetworkData && setTitle && setQuoteData && setPlotSummaries && setSentimentValues && setInflectionPoints && setCoverUrl && setCharacterSentimentValues && setChapterData && setChapterNetworkData && setLexicalRichness) {
                await fetchNovelData(novelId ?? "", setNovelData, setCharacterData, setNetworkData, setTitle, setQuoteData, setPlotSummaries, setSentimentValues, setInflectionPoints, setCoverUrl, setCharacterSentimentValues, setChapterData, setChapterNetworkData, setCooccurrenceNetworkData, setTopCharacterRelationships, setMotifData, setLexicalRichness);
            }
        };
        fetchData();
    }, [novelId, !lexicalRichness]);

    useEffect(() => {
        document.title = `Vocabulary Richness | ${bookTitle}`;
    }, [bookTitle]);

    return (
        <div className="mx-auto container px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Miscellany", url: `/miscellany/${novelId}` }, { label: "Vocabulary", url: `/vocabulary/${novelId}` }]} />
                <h1 className="text-5xl font-serif mb-4">Vocabulary Richness</h1>
                <p className="text-md text-gray-700">
                    This page analyzes the richness of the novel's vocabulary, including unique words, lexical diversity, and more.
                </p>
            </div>
            <hr className="my-4 border-gray-300" />
            <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex flex-row justify-between items-center">
                    <h1></h1>
                    <h1 className="text-xl font-serif text-center mb-4">
                        Vocabulary Richness by Character
                    </h1>
                    <TooltipComponent 
                        title={"Vocabulary Richness"}
                        content={"Vocabulary richness measures the diversity of a character's vocabulary. A higher value indicates that a character uses a wider range of unique words, which can suggest greater complexity or depth in their dialogue and narration. \n\nMATTR (Moving-Average Type-Token Ratio) is a common metric for vocabulary richness that accounts for text length, providing a more accurate measure of vocabulary diversity."}
                    />
                </div>
                <hr className="my-4 border-gray-300" />
                <VocabularyBarChart data={lexicalRichnessData.map((d) => ({ ...d, character: humanize(d.character) }))} />
            </div>
            {/* <h1 className="text-2xl font-serif mb-4 mt-4">Overview</h1>
            <p>
                {mostTalkativeCharacter !== mostDiverseCharacter && mostTalkativeCharacter ? (<>
                    The most talkative character is <strong>{humanize(mostTalkativeCharacter.character)}</strong> with {mostTalkativeCharacter.confidence.word_count} words spoken, while the most lexically diverse character is <strong>{humanize(mostDiverseCharacter.character)}</strong> with a MATTR of {mostDiverseCharacter.confidence.mattr.toFixed(3)}.
                </>) : (
                    mostTalkativeCharacter ? (
                        <>
                            The most talkative and lexically diverse character is <strong>{humanize(mostTalkativeCharacter.character)}</strong>, who speaks {mostTalkativeCharacter.confidence.word_count} words with a MATTR of {mostTalkativeCharacter.confidence.mattr.toFixed(3)}.
                        </>
                    ) : (
                        <>No character data available.</>
                    )
                )}  
            </p> */}
            <hr className="my-8 border-gray-300" />
            <h1 className="text-2xl font-serif mb-4">Highlights</h1>
            <div className="space-y-6">
                {mostDiverseCharacterQuote && mostDiverseCharacter && (
                    <div>
                        <p className="text-sm text-black mb-2">
                            Most diverse — {humanize(mostDiverseCharacter.character)} (MATTR: {mostDiverseCharacter.confidence.mattr.toFixed(3)})
                        </p>
                        <blockquote className="border-l-4 border-green-800 pl-4 italic text-gray-700">
                            "{mostDiverseCharacterQuote.content}"
                        </blockquote>
                        <p className="text-xs text-gray-400 mt-1">Chapter {mostDiverseCharacterQuote.chapter_number}</p>
                        <p className="text-xs text-gray-700 mt-2 bg-gray-100 p-2 rounded w-fit">
                            Words unique to <span className="font-semibold">{humanize(mostDiverseCharacter.character)}</span>: {exclusiveWords(mostDiverseCharacter.character).slice(0, 10).map(word => word.toLowerCase()).join(', ')}
                        </p>
                    </div>
                )}
                {leastDiverseCharacterQuote && leastDiverseCharacter && (
                    <div>
                        <p className="text-sm text-black mb-2">
                            Least diverse — {humanize(leastDiverseCharacter.character)} (MATTR: {leastDiverseCharacter.confidence.mattr.toFixed(3)})
                        </p>
                        <blockquote className="border-l-4 border-gray-400 pl-4 italic text-gray-700">
                            "{leastDiverseCharacterQuote.content}"
                        </blockquote>
                        <p className="text-xs text-gray-400 mt-1">Chapter {leastDiverseCharacterQuote.chapter_number}</p>
                        <p className="text-xs text-gray-700 mt-2 bg-gray-100 p-2 rounded w-fit">
                            Words unique to <span className="font-semibold">{humanize(leastDiverseCharacter.character)}</span>: {exclusiveWords(leastDiverseCharacter.character).slice(0, 10).map(word => word.toLowerCase()).join(', ')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Vocabulary;