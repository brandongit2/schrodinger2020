export function sum(array: number[]) {
    return array.reduce((acc, cur) => acc + cur, 0);
}

export function dist(pos1: [number, number], pos2: [number, number]) {
    return Math.sqrt((pos2[0] - pos1[0]) ** 2 + (pos2[1] - pos1[1]) ** 2);
}
