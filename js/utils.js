function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function stdev (x) {
    const n = x.length;
    const mean = x.reduce((a, b) => a + b) / n;
    return Math.sqrt(x.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / (n-1));
}
