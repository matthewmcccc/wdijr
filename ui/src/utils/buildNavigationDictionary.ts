const buildNavigationDictionary = (names: string[]) => {
    const navigationDict: { [key: string]: { left: string | null, right: string | null } } = {};

    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const prevName = i > 0 ? names[i - 1] : null;
        const nextName = i < names.length - 1 ? names[i + 1] : null;

        navigationDict[name] = {
            left: prevName,
            right: nextName
        }
    }

    return navigationDict;
}

export default buildNavigationDictionary;