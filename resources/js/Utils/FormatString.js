export const TruncateString = (str, length = 12) => {
    if (str === null || str === undefined) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
}