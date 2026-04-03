import axios from "axios";

const fetchNovelData = async (novelId: string, setNovelData: (data: any) => void, setCharacterData: (data: any) => void, setNetworkData: (data: any) => void, setTitle: (title: string) => void, setQuoteData: (data: any) => void, setPlotSummaries: (data: any) => void, setSentimentValues: (data: any) => void, setInflectionPoints: (data: any) => void, setCoverUrl: (url: string) => void, setCharacterSentimentValues: (data: any) => void, setChapterData: (data: any) => void, setChapterNetworkData: (data: any) => void, setCooccurrenceNetworkData: (data: any) => void, setAuthorData: (data: any) => void, setMotifData: (data: any) => void, setLexicalRichness: (data: any) => void, setChapterCooccurrenceData: (data: any) => void) => {
    try {
        const result = await axios(`${import.meta.env.VITE_API_URL}/novel/${novelId}/data`);
        const data = result.data;
        if (data) {
            setNovelData?.(data.novel);
            setCharacterData?.(data.characters);
            setNetworkData?.(data.analysis.conversational_network);
            setTitle?.(data.novel.title);
            setQuoteData?.(data.quotes);
            setPlotSummaries?.(data.analysis.plot_summaries);
            setSentimentValues?.(data.analysis.sentiment_values);
            setInflectionPoints?.(data.analysis.inflection_points);
            setCoverUrl?.(`${import.meta.env.VITE_API_URL.replace('/api', '')}${data.novel.cover_url}`);
            setCharacterSentimentValues?.(data.analysis.character_sentiment);
            setChapterData?.(data.chapters);
            setChapterNetworkData?.(data.analysis.chapter_networks);
            setCooccurrenceNetworkData?.(data.analysis.cooccurrence_network);
            setAuthorData?.(data.author);
            setMotifData?.(data.analysis.motifs.motif_groups);
            setLexicalRichness?.(data.analysis.lexical_richness);
            setChapterCooccurrenceData?.(data.analysis.chapter_cooccurrence_network);
        } else {
            console.error("No characters field in response:", data);
        }
    } catch (err) {
        console.log(`Error fetching novel data for novelId: ${novelId}:`, err);
        console.error(err);
    }
}

export default fetchNovelData;