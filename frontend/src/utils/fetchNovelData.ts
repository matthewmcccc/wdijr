import axios from "axios";
import type { BookContextType } from "../contexts/bookContext";

const fetchNovelData = async (novelId: string, ctx: BookContextType) => {
    try {
        const result = await axios(`${import.meta.env.VITE_API_URL}/novel/${novelId}/data`);
        const data = result.data;
        if (!data) {
            console.error("No data in response:", data);
            return;
        }

        ctx.setNovelData?.(data.novel);
        ctx.setCharacterData?.(data.characters);
        ctx.setNetworkData?.(data.analysis.conversational_network);
        ctx.setTitle?.(data.novel.title);
        ctx.setQuoteData?.(data.quotes);
        ctx.setPlotSummaries?.(data.analysis.plot_summaries);
        ctx.setSentimentValues?.(data.analysis.sentiment_values);
        ctx.setInflectionPoints?.(data.analysis.inflection_points);
        ctx.setCoverUrl?.(`${import.meta.env.VITE_API_URL.replace('/api', '')}${data.novel.cover_url}`);
        ctx.setCharacterSentimentValues?.(data.analysis.character_sentiment);
        ctx.setChapterData?.(data.chapters);
        ctx.setChapterNetworkData?.(data.analysis.chapter_networks);
        ctx.setCooccurrenceNetworkData?.(data.analysis.cooccurrence_network);
        ctx.setAuthorData?.(data.author);
        ctx.setMotifData?.(data.analysis.motifs.motif_groups);
        ctx.setLexicalRichness?.(data.analysis.lexical_richness);
        ctx.setChapterCooccurrenceData?.(data.analysis.chapter_cooccurrence_network);
        ctx.setChapterOccurenceData?.(data.analysis.character_chapter_occurences);
    } catch (err) {
        console.log(`Error fetching novel data for novelId: ${novelId}:`, err);
        console.error(err);
    }
};

export default fetchNovelData;