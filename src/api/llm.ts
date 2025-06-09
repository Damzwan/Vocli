import {VocabImportMode, WordItem} from "@/types";

const api_url = import.meta.env.VITE_IMPORTER_API_URL; // use VITE_ prefix for Vite projects (Vue 3)

export function useLLM() {
    async function importVocabulary(inputText: string, knownLanguage: string, learnLanguage: string, mode: VocabImportMode, amount = 20): Promise<WordItem[]> {
        const params = new URLSearchParams({
            inputText,
            knownLanguage,
            learnLanguage,
            mode,
            amount: amount.toString(),
        });

        const url = `${api_url}?${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Vocabulary API error: ${errorText}`);
            }


            const data = await response.json();
            return data.words || [];
        } catch (err) {
            console.error('Vocabulary import failed:', err);
            return [];
        }
    }

    return {
        importVocabulary
    };
}
