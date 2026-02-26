import { createContext } from "react";

type AttributedQuote = {
    speaker: string,
    span: [number, number],
    sentiment: number,
}

interface BookContextType {
    characterData: Record<string, {
        description: string,
        traits: string[],
    }>,
    characterNavigationDict: Record<string, {
        left: string | null,
        right: string | null,
    }>,
    topCharacterRelationships: Record<string, [string, number][]>,
    topCharacterQuotes: Record<string, { quote: string, sentiment: number }[]>,
    attributedQuotes: AttributedQuote[],
    summaries: Record<string, { summary: string, description: string }>,
}

export const BookContext = createContext<BookContextType | null>(null);