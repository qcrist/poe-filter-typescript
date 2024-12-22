export function range(start: number, endInclusive: number): number[] {
    const length = endInclusive - start + 1;
    return Array.from({length}, (_, i) => i + start);
}