import {WordAlternativeResponse} from "@/types";

const api_url = import.meta.env.VITE_TRANSLATE_API_URL;
const translations_alternative_api_url = import.meta.env.VITE_TRANSLATION_ALTERNATIVE_API_URL;

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

    async function findTranslationAlternatives(text: string, mainTranslation: string, knownLanguage: string, learnLanguage: string): Promise<string[]> {
        const params = JSON.stringify({
            text,
            mainTranslation,
            knownLanguage,
            learnLanguage,
        })

        try {
            const response = await fetch(translations_alternative_api_url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: params,
            });
            if (!response.ok) {
                throw new Error(`Translation alternatives API error: ${response.statusText}`);
            }


            const data = await response.json() as WordAlternativeResponse;
            return data.alternatives || [];
        } catch (err) {
            console.error('Translation alternatives failed:', err);
            return [];
        }
    }

    return {
        translate,
        findTranslationAlternatives
    };
}
