export function sanitize(text: string): string {
    return text
        .normalize("NFD")                          // Break letters and accents apart
        .replace(/[\u0300-\u036f]/g, '')           // Remove accents
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
        .trim()                                    // Only remove leading/trailing whitespace
        .toLowerCase();                            // Lowercase
}

export function sanitize_lite(text: string): string {
    return text
        .normalize("NFD")                          // Break letters and accents apart
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
        .trim()                                    // Only remove leading/trailing whitespace
        .toLowerCase();                            // Lowercase
}

function levenshtein(a: string, b: string): number {
    const matrix = Array.from({length: b.length + 1}, (_, i) => [i]);
    for (let j = 1; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,     // deletion
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j - 1] + 1  // substitution
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

export function similarityScore(a: string, b: string): number {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - levenshtein(a, b) / maxLen;
}

export function shuffle<T>(array: T[]): T[] {
    const result = [...array]; // make a shallow copy
    let currentIndex = result.length;

    while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [result[currentIndex], result[randomIndex]] = [
            result[randomIndex],
            result[currentIndex]
        ];
    }

    return result;
}