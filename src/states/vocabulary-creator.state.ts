import {defineStore} from "pinia";
import {ref} from "vue";
import {WordItem, WordPack} from "@/types";
import {Preferences} from "@capacitor/preferences";
import {v4 as uuidv4} from "uuid";
import {LANGUAGE} from "@/config/languages.config";
import {useAppStore} from "@/states/app.state";
import {useI18n} from "vue-i18n";

export const useVocabularyCreatorStore = defineStore('vocabulary-creator', () => {
    const id = ref('')
    const name = ref('');
    const appStore = useAppStore();
    const learnLanguage = ref<LANGUAGE>(appStore.learnLanguage);
    const knownLanguage = ref<LANGUAGE>(appStore.knownLanguage);
    const wordItems = ref<WordItem[]>([])

    const {t} = useI18n()

    async function saveWordPack() {
        const packToSave: WordPack = {
            words: wordItems.value,
            id: id.value,
            learnLanguage: learnLanguage.value,
            knownLanguage: knownLanguage.value,
            lastEdited: new Date().toISOString(),
            name: name.value == "" ? t('create.word_pack_name_placeholder') : name.value,
        }
        await Preferences.set({
            key: `pack_${id.value}`,
            value: JSON.stringify(packToSave),
        });
    }

    async function retrieveCurrentWordPark() {
        const retrievedWordPackId = await Preferences.get({key: "wordPackId"})
        if (!retrievedWordPackId.value) {
            const newId = uuidv4();
            Preferences.set({key: "wordPackId", value: newId});
            id.value = newId;
        } else {
            id.value = retrievedWordPackId.value;
            const wordPack = await Preferences.get({key: `pack_${id.value}`})
            if (wordPack.value) {
                const parsedWordPark = JSON.parse(wordPack.value) as WordPack
                wordItems.value = parsedWordPark.words
                learnLanguage.value = parsedWordPark.learnLanguage
                knownLanguage.value = parsedWordPark.knownLanguage
                name.value = parsedWordPark.name
            }
        }
    }

    async function fetchWordPacks(): Promise<WordPack[]> {
        const preferenceKeys = await Preferences.keys()
        const wordPackIds = preferenceKeys.keys.filter(key => key.startsWith('pack'))
        return (await Promise.all(wordPackIds.map(async id => {
            const wordPackString = await Preferences.get({key: id})
            if (!wordPackString.value) return undefined
            const parsed = JSON.parse(wordPackString.value)
            return parsed as WordPack
        }))).filter(item => !!item).sort((a, b) => new Date(a.lastEdited).getTime() - new Date(b.lastEdited).getTime())
    }


    return {name, learnLanguage, knownLanguage, id, wordItems, retrieveCurrentWordPark, saveWordPack, fetchWordPacks};
})