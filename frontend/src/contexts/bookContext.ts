import { createContext } from "react";


type AttributedQuote = {
    speaker: string,
    span: [number, number],
    sentiment: number,
}

interface BookContextType {
    characterData: Array<{
        id: Number,
        first_name: string;
        last_name: string;
        description: string,
        novel_id: number,
    }> | null,
    characterNavigationDict: Record<string, {
        left: string | null,
        right: string | null,
    }> | null,
    topCharacterRelationships: Record<string, [string, number][]>,
    topCharacterQuotes: Record<string, { quote: string, sentiment: number }[]>,
    attributedQuotes: AttributedQuote[],
    summaries: Record<string, { summary: string, description: string }>,
    setCharacterData: (data: Array<{ id: Number, first_name: string, last_name: string, description: string, novel_id: number }>) => void,
}

export const BookContext = createContext<BookContextType | null>(null);