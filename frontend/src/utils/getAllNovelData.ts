const getAllNovelData = async (novelId: number) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/novel/${novelId}/data`);
    const data = await response.json();
    return data;
}