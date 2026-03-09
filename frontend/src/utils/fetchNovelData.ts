import axios from "axios";

const fetchNovelData = async (novelId: string, setNovelData: (data: any) => void, setCharacterData: (data: any) => void, setNetworkData: (data: any) => void, setTitle: (title: string) => void, setQuoteData: (data: any) => void) => {
    try {
        console.log(`fetching novel data for novelId: ${novelId}...`);
        const result = await axios(`${import.meta.env.VITE_API_URL}/novel/${novelId}/data`);
        const data = result.data;
        if (data) {
            console.log(`data from fetchNovelData: ${JSON.stringify(data)}`);
            setNovelData?.(data.novel);
            setCharacterData?.(data.characters);
            setNetworkData?.(data.analysis.network);
            setTitle?.(data.novel.title);
            setQuoteData?.(data.quotes);
        } else {
            console.error("No characters field in response:", data);
        }
    } catch (err) {
        console.log(`Error fetching novel data for novelId: ${novelId}:`, err);
        console.error(err);
    }
}

export default fetchNovelData;