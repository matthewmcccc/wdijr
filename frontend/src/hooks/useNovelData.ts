import { useContext, useEffect } from "react";
import { BookContext } from "../contexts/bookContext";
import fetchNovelData from "../utils/fetchNovelData";

const useNovelData = (novelId: string | undefined) => {
    const ctx = useContext(BookContext);

    useEffect(() => {
        if (!novelId || !ctx) return;
        if (ctx.novelData && ctx.novelData.id === novelId) return;
        fetchNovelData(novelId, ctx);
    }, [novelId]);

    return ctx;
};

export default useNovelData;