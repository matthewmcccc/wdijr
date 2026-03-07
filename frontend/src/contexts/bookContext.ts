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
        novel_id: number,
    }> | null,
    characterNavigationDict: Record<string, {
        left: string | null,
        right: string | null,
    }> | null,
    topCharacterRelationships: Record<string, [string, number][]>,
    title: string,
    setTitle: (title: string) => void,
    topCharacterQuotes: Record<string, { quote: string, sentiment: number }[]>,
    attributedQuotes: AttributedQuote[],
    summaries: Record<string, { summary: string, description: string }>,
    setCharacterData: (data: Array<{ id: Number, name: string, summary: string, description: string, novel_id: number }>) => void,
    networkData: { links: any[], nodes: any[] },
    setNetworkData: (data: { links: any[], nodes: any[] }) => void,
}

export const BookContext = createContext<BookContextType | null>(null);