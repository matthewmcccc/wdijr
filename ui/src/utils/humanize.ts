import decamelize from "./decamelize"

const humanize = (str: string, options: { preserveCase?: boolean } = {}) => {
    if (!options.preserveCase) {
        str = decamelize(str);
        str = str.toLowerCase();
    }

    str = str.replace(/[_-]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
	str = str.charAt(0).toUpperCase() + str.slice(1);
    str = str.replace(/\b\w/g, char => char.toUpperCase());

    return str;
}


export default humanize;