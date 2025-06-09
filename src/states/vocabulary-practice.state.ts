import {defineStore} from "pinia";
import {ref} from "vue";
import {PracticeMethodName, PracticeOrder, WordItem, WordPack, WrongWordItem} from "@/types";
import {AVG_PRACTICE_WORDS} from "@/config/exercises/PRACTICE_MODES";

export const useVocabularyPracticeStore = defineStore('vocabulary-practice', () => {
    const wordPack = ref<WordPack>()
    const amountOfWords = ref<number>(AVG_PRACTICE_WORDS)
    const practiceOrder = ref<PracticeOrder>(PracticeOrder.knownToLearn);
    const practiceMethodName = ref<PracticeMethodName>("translation")

    const copyOfWords = ref<WordItem[]>([])
    const wrongWords = ref<WrongWordItem[]>([]);
    const hintsUsed = ref<number>(0)
    const wordsSkipped = ref<number>(0)
    const practiceTime = ref<number>(0)


    return {
        wordPack,
        amountOfWords,
        practiceOrder,
        wrongWords,
        hintsUsed,
        wordsSkipped,
        practiceTime,
        copyOfWords,
        practiceMethodName
    };
})