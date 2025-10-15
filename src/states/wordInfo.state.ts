import {defineStore} from "pinia";
import {ref} from "vue";
import {LANGUAGE} from "@/config/languages.config";

export type WordInfoInput = {
    knownLanguage: LANGUAGE;
    learnLanguage: LANGUAGE;
    knownWord: string;
    learnWord: string;
};

export type WordInfoRes = {
    partOfSpeech: string[];
    synonyms: string[];
    antonyms: string[];
    examples: {
        learnLanguageSentence: string;
        translation: string;
    }[];
};

const api_url = import.meta.env.VITE_WORD_INFO_URL; // use VITE_ prefix for Vite projects (Vue 3)

export const useWordInfoStore = defineStore("wordInfoStore", () => {
    const wordInfoActionSheetOpen = ref(false);
    const wordInfoInput = ref<WordInfoInput>();

    // 🔹 Data & loading
    const wordInfoRes = ref<WordInfoRes | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // 🔹 Fetch function
    const fetchWordInfo = async () => {
        if (!wordInfoInput.value) return;

        loading.value = true;
        error.value = null;

        try {
            const response = await fetch(api_url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(wordInfoInput.value),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            wordInfoRes.value = await response.json() as WordInfoRes;
        } catch (err: any) {
            console.error("Error fetching word info:", err);
            error.value = err.message || "Failed to fetch word info";
        } finally {
            loading.value = false;
        }
    };

    function open(input: WordInfoInput) {
        wordInfoRes.value = null;
        error.value = null;
        loading.value = false;
        wordInfoInput.value = input;
        wordInfoActionSheetOpen.value = true;
        void fetchWordInfo();
    }


    // 🔹 Reset function
    const close = () => {
        wordInfoActionSheetOpen.value = false;
        wordInfoInput.value = undefined;
        wordInfoRes.value = null;
        error.value = null;
        loading.value = false;
    };

    return {
        // state
        wordInfoActionSheetOpen,
        wordInfoInput,
        wordInfoRes,
        loading,
        error,

        // actions
        close,
        open
    };
});
