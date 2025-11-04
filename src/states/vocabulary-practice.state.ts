import {defineStore, storeToRefs} from "pinia";
import {ref} from "vue";
import {PracticeMethodName, PracticeOrder, WordItem, WordPack, WordSelectionStrategy, WrongWordItem} from "@/types";
import {AVG_PRACTICE_WORDS} from "@/config/exercises/practiceModes";
import {debounce} from "@/helpers/app.helper";
import {FirebaseFirestore} from "@capacitor-firebase/firestore";
import {useAuthStore} from "@/states/auth.state";
import {Preferences} from "@capacitor/preferences";

export const useVocabularyPracticeStore = defineStore('vocabulary-practice', () => {
    const wordPack = ref<WordPack>()
    const amountOfWords = ref<number>(AVG_PRACTICE_WORDS)
    const practiceOrder = ref<PracticeOrder>(PracticeOrder.knownToLearn);
    const practiceMethodName = ref<PracticeMethodName>("translation")
    const wordSelectionStrategy = ref<WordSelectionStrategy>(WordSelectionStrategy.random)

    const copyOfWords = ref<WordItem[]>([])
    const wrongWords = ref<WrongWordItem[]>([]);
    const hintsUsed = ref<number>(0)
    const wordsSkipped = ref<number>(0)
    const practiceTime = ref<number>(0)


    const authStore = useAuthStore();

    async function updateLastPracticed() {
        if (!wordPack.value || !authStore.user?.uid) return;
        const { wordPacks } = storeToRefs(authStore);

        wordPack.value.lastPracticed = new Date().toISOString();

        // Update locally
        wordPacks.value = wordPacks.value.map(p => {
            if (p.id === wordPack.value!.id) {
                return {
                    ...p,
                    lastPracticed: new Date().toISOString(),
                };
            }
            return p;
        });

        await Preferences.set({
            key: `pack-${wordPack.value.id}`,
            value: JSON.stringify(wordPack.value),
        });

        try {
            const packRef = `wordPacks/${authStore.user.uid}/packs/${wordPack.value.id}`;
            const metaRef = `wordPacks/${authStore.user.uid}/metadata/${wordPack.value.id}`;

            await Promise.all([
                FirebaseFirestore.setDocument({
                    reference: packRef,
                    data: {
                        lastPracticed: new Date().toISOString(),
                    },
                    merge: true,
                }),
                FirebaseFirestore.setDocument({
                    reference: metaRef,
                    data: {
                        lastEdited: new Date().toISOString(),
                    },
                    merge: true,
                })
            ]);

            console.log(`🔥 Word pack '${wordPack.value.name}' updated with lastPracticed timestamp`);
        } catch (error) {
            console.error("Error saving word pack to Firestore:", error);
        }
    }



    return {
        wordPack,
        amountOfWords,
        practiceOrder,
        wrongWords,
        hintsUsed,
        wordsSkipped,
        practiceTime,
        copyOfWords,
        practiceMethodName,
        wordSelectionStrategy,
        updateLastPracticed
    };
})