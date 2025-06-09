const api_url = import.meta.env.VITE_TRANSLATE_API_URL; // use VITE_ prefix for Vite projects (Vue 3)

export function useTranslate() {
    async function translate(text: string, fromLanguage: string, toLanguage: string): Promise<string[]> {
        const params = new URLSearchParams({
            text,
            knownLanguage: fromLanguage,
            learnLanguage: toLanguage
        });

        const url = `${api_url}?${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Translation API error: ${response.statusText}`);
            }


            const data = await response.json();
            return data.translated || [];
        } catch (err) {
            console.error('Translation failed:', err);
            return [];
        }
    }

    return {
        translate
    };
}
