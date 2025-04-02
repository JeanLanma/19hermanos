/** return string like $9,999,99 **/
export const FormatPrice = (n) => {
    if (n === null || n === undefined) return '';
    return '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const Round = (n, d = 2) => {
    return Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
}