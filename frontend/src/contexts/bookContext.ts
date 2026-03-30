import { createContext } from "react";


type AttributedQuote = {
    speaker: string,
    span: [number, number],
    sentiment: number,
}

interface BookContextType {
    characterData: Array<{
        id: Number,
        name: string;
        description: string,
        novel_id: string,
        image_url: string,
    }> | null,
    characterNavigationDict: Record<string, {
        left: string | null,
        right: string | null,
    }> | null,
    topCharacterRelationships: Record<string, [string, number][]>,
    title: string,
    novelData: {
        author: string;
        id: string;
        title: string;
        description: string;
    }
    setNovelData: (data: { author: string; id: string; title: string }) => void,
    setTitle: (title: string) => void,
    topCharacterQuotes: Record<string, { quote: string, sentiment: number }[]>,
    attributedQuotes: AttributedQuote[],
    setCharacterData: (data: Array<{ id: Number, name: string, summary: string, description: string, novel_id: string }>) => void,
    networkData: { links: any[], nodes: any[] },
    setNetworkData: (data: { links: any[], nodes: any[] }) => void,
    associatedQuotes: Record<string, { quote: string, sentiment: number }[]>,
    setAssociatedQuotes: (data: Record<string, { quote: string, sentiment: number }[]>) => void,
    setTopCharacterRelationships: (data: Record<string, [string, number, number][]>) => void,
    quoteData: (any),
    setQuoteData: (data: any) => void,
    sentimentValues: number[] | null,
    setSentimentValues: (data: number[]) => void,
    inflectionPoints: number[] | null,
    setInflectionPoints: (data: number[]) => void,
    plotSummaries: Record<string, string> | null,
    setPlotSummaries: (data: Record<string, string>) => void,
    coverUrl: string | null,
    setCoverUrl: (url: string) => void,
    characterSentimentValues?: Record<string, number[]>,
    setCharacterSentimentValues?: (data: Record<string, number[]>) => void,
    chapterData: Array<{
        chapter_number: number;
        title: string;
        summary: string;
        overview: string;
        novel_id: string;
        sentiment: number[];
    }> | null,
    setChapterData: (data: Array<{ chapter_number: number; title: string; summary: string; overview: string; novel_id: string; sentiment: number[] }>) => void,
    setChapterNetworkData: (data: { links: any[], nodes: any[] }) => void,
    chapterNetworkData: { links: any[], nodes: any[] },
    chapterLengths: number[] | null,
    setChapterLengths: (data: number[]) => void,
    cooccurrenceNetworkData: Array<{ source: string; target: string; value: number }>,
    setCooccurrenceNetworkData: (data: Array<{ source: string; target: string; value: number }>) => void,
    authorData: {
        name: string;
        description: string;
        image_url: string;
        novel_id: string;
        other_works: Array<{ title: string; year: number; image_url: string }>;
    } | null,
    setAuthorData: (data: { name: string; description: string; image_url: string; novel_id: string; other_works: Array<{ title: string; year: number; image_url: string }> }) => void,
    motifData: Record<string, string[]>,
    setMotifData: (data: Record<string, string[]>) => void,
    lexicalRichness: (data: Array<{character: string, confidence: number}>) => void,
    setLexicalRichness: (data: Array<{character: string, confidence: number}>) => void,
}

export const BookContext = createContext<BookContextType | null>(null);