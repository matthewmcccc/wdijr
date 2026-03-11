const cumulativeSentiment = (
    speaker: string, 
    data: Record<string, Record<string, number[]>>
): Record<string, number[]> => {
    const targets = data[speaker];
    if (!targets) return {};

    const result: Record<string, number[]> = {};
    for (const [target, values] of Object.entries(targets)) {
        let sum = 0;
        result[target] = values.map(v => { sum += v; return sum; });
    }
    return result;
};

export default cumulativeSentiment;