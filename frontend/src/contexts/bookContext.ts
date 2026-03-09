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
    setTopCharacterRelationships: (data: Record<string, [string, number][]>) => void,
}

export const BookContext = createContext<BookContextType | null>(null);