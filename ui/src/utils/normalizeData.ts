const normalizeData = (data: number[]) => {
    const dataLength = data.length
    const normalizedData = data.map((value) => value / dataLength)
    return normalizedData
}

export default normalizeData