import { createContext } from "react";

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
}

export const BookContext = createContext<BookContextType | null>(null);