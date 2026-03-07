const buildNameMap = (characters: Record<string, any>) => {
    const nameMap: Record<string, string> = {};
    for (const char of characters.values()) {
        nameMap[char.name] = char.name.split(" ")[0].toLowerCase();
    }
    return nameMap
}

export default buildNameMap;