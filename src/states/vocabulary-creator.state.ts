import {defineStore, storeToRefs} from "pinia";
import {ref, computed, watch} from "vue";
import {Preferences} from "@capacitor/preferences";
import {App} from "@capacitor/app";
import {FirebaseFirestore} from "@capacitor-firebase/firestore";
import {useAuthStore} from "@/states/auth.state";
import {debounce, isNative} from "@/helpers/app.helper";
import type {WordPack} from "@/types";

const SAVE_DEBOUNCE_TIME = 5000;

export const useVocabularyCreatorStore = defineStore("vocabulary-creator", () => {
    const wordPack = ref<WordPack>();
    const authStore = useAuthStore();


    // 🔥 Debounced Firestore + Metadata save
    const saveWordPackToFirestore = debounce(async (pack: WordPack) => {
        const userId = authStore.authUser?.uid;
        if (!userId) return;

        try {
            const packRef = `wordPacks/${userId}/packs/${pack.id}`;
            const metaRef = `wordPacks/${userId}/metadata/${pack.id}`;

            // 🧩 1️⃣ Save full pack
            await Promise.all([
                FirebaseFirestore.setDocument({
                    reference: packRef,
                    data: pack,
                }),
                FirebaseFirestore.setDocument({
                    reference: metaRef,
                    data: {
                        lastEdited: pack.lastEdited,
                    },
                })
            ])

            console.log(`🔥 Word pack '${pack.name}' saved to Firestore (+ metadata)`);
        } catch (error) {
            console.error("Error saving word pack to Firestore:", error);
        } finally {
        }
    }, SAVE_DEBOUNCE_TIME);

    async function saveWordPack() {
        if (!wordPack.value) return;

        wordPack.value.lastEdited = new Date().toISOString();
        if (!wordPack.value.name) wordPack.value.name = "New Pack";

        // 💾 1️⃣ Save locally
        await Preferences.set({
            key: `pack-${wordPack.value.id}`,
            value: JSON.stringify(wordPack.value),
        });

        // 🧠 2️⃣ Update store
        const {wordPacks} = storeToRefs(authStore);
        const existingIndex = wordPacks.value.findIndex((p) => p.id === wordPack.value!.id);
        if (existingIndex === -1) {
            wordPacks.value = [...wordPacks.value, wordPack.value];
        }

        // 🔥 3️⃣ Save to Firestore (debounced)
        saveWordPackToFirestore(wordPack.value);
    }

    // 🧩 Flush pending saves on app pause (mobile)
    App.addListener("pause", async () => {
        if (!wordPack.value) return;
        if (saveWordPackToFirestore.pending || saveWordPackToFirestore.running) {
            await saveWordPackToFirestore.flush(wordPack.value);
        }
    });

    // 💻 Flush pending saves on browser unload
    if (!isNative()) {
        window.addEventListener("beforeunload", async (event) => {
            if (!wordPack.value) return;
            if (saveWordPackToFirestore.pending || saveWordPackToFirestore.running) {
                event.preventDefault();
                await saveWordPackToFirestore.flush(wordPack.value);
                event.returnValue = ""; // show native "Leave site?" dialog
            }
        });
    }


    return {
        wordPack,
        saveWordPack,
    };
});
