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
}

export const BookContext = createContext<BookContextType | null>(null);