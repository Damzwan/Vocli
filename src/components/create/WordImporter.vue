<template>
  <ion-modal trigger="wordsImporter" @willPresent="reset">
    <ion-header>
      <div class="flex items-center px-4 py-2 h-16">
        <ion-button fill="clear" @click="modalController.dismiss()">
          <ion-icon slot="icon-only" :icon="arrowBack"/>
        </ion-button>
        <p class="text-2xl font-bold pl-4">{{ t(`${tPrefix}.import_words`) }}</p>
      </div>
    </ion-header>

    <ion-content>
      <div class="p-4 w-full h-full" v-if="wordImportState == 'input'">
        <div>
          <p class="text-xl pb-4">{{ t(`${tPrefix}.import_method`) }}</p>
          <ion-radio-group v-model="importMode" class="w-full">
            <ion-item lines="none"
                      class="bg-card-background hover:bg-card-background-hover active:bg-card-background-active rounded-lg p-3"
                      @click="importMode = VocabImportMode.raw">
              <ion-radio slot="start" :value="VocabImportMode.raw"/>
              <ion-label class="text-white text-base pl-2">
                📋 {{ t(`${tPrefix}.raw_words`) }}
              </ion-label>
            </ion-item>

            <ion-item lines="none"
                      class="bg-card-background hover:bg-card-background-hover active:bg-card-background-active rounded-lg p-3 mt-3"
                      @click="importMode = VocabImportMode.generate">
              <ion-radio slot="start" :value="VocabImportMode.generate"/>
              <ion-label class="text-white text-base pl-2">
                🤖 {{ t(`${tPrefix}.topic`) }}
              </ion-label>
            </ion-item>
          </ion-radio-group>
        </div>

        <div v-if="importMode === VocabImportMode.raw" class="py-6">
          <ion-textarea
              v-model="rawImport"
              :placeholder="t(`${tPrefix}.raw_placeholder`)"
              :auto-grow="true"
              class="bg-neutral-800 rounded-lg text-white p-3"
              :maxlength="CHARACTER_LIMIT"
              counter
              @keyup.enter="onGenerateClick"
          />
        </div>

        <div v-if="importMode === VocabImportMode.generate" class="py-6">
          <ion-textarea
              v-model="generateTopic"
              :placeholder="t(`${tPrefix}.topic_placeholder`)"
              :auto-grow="true"
              class="bg-neutral-800 rounded-lg text-white p-3"
              @keyup.enter="onGenerateClick"
          />


          <p class="text-2xl text-zinc-400 text-center pt-8">
            {{ t(`${tPrefix}.amount`) }}
            <span class="font-semibold text-white text-3xl">{{ amountOfWords }}</span>
          </p>
          <ion-range
              @ionInput="(ev) => amountOfWords = (ev.detail.value as number)"
              :min="MIN_IMPORT_AMOUNT"
              :max="MAX_IMPORT_AMOUNT"
              :value="amountOfWords"
              class="w-full w-max-[200px]"
          />

        </div>

        <ion-button expand="block" @click="onGenerateClick">
          {{ t(`${tPrefix}.import_words`) }}
        </ion-button>
      </div>

      <div v-else-if="wordImportState == 'loading'" class="p-4 w-full h-full flex justify-center items-center">
        <ion-spinner color="primary" size="lg"/>
      </div>

      <div v-else-if="wordImportState == 'output'" class="p-4 w-full h-full flex flex-col">
        <div class="flex flex-col space-y-3 pb-6 grow overflow-scroll">
          <WordToImportCard :word-item="word" :key="word.from" v-for="(word, i) in wordsToImport"
                            @onDelete="() => onDelete(i)" @onEdit="word => onEdit(word, i)"/>
        </div>

        <ion-button @click="addToWordPack" class="block">{{ t(`${tPrefix}.add`) }} ({{
            wordsToImport.length
          }})
        </ion-button>
      </div>

    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">

import {VocabImportMode, WordItem} from "@/types";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonRange,
  IonSpinner,
  IonTextarea,
  modalController,
} from "@ionic/vue";
import {arrowBack} from "ionicons/icons";
import {ref} from "vue";
import {useLLM} from "@/api/llm";
import {useVocabularyCreatorStore} from "@/states/vocabulary-creator.state";
import {LANGUAGE_LABELS} from "@/config/languages.config";
import {useAppStore} from "@/states/app.state";
import WordToImportCard from "@/components/create/WordToImportCard.vue";
import {sanitize_lite} from "@/helpers/exercises";
import {areWordsEqual} from "@/helpers/create";
import {useI18n} from "vue-i18n";

type WordImportState = "input" | "loading" | 'output'
const CHARACTER_LIMIT = 300
const MIN_IMPORT_AMOUNT = 5
const MAX_IMPORT_AMOUNT = 50
const START_IMPORT_AMOUNT = 10

const generateTopic = ref("")
const rawImport = ref("")
const importMode = ref<VocabImportMode>(VocabImportMode.raw) // default to generate
const wordImportState = ref<WordImportState>("input")
const {importVocabulary} = useLLM()

const wordsToImport = ref<WordItem[]>([])
const amountOfWords = ref<number>(START_IMPORT_AMOUNT)

const {t} = useI18n()
const tPrefix = "create.wordsImporter"

const emits = defineEmits<{
  (e: 'importWords', words: WordItem[]): void
}>()

async function onGenerateClick() {
  if ((importMode.value === VocabImportMode.generate && generateTopic.value === '') || (importMode.value === VocabImportMode.raw && rawImport.value === '')) {
    const {showToast} = useAppStore()
    showToast(t("toast.input_not_empty"), {color: 'danger'})
    return;
  }
  const {wordPack} = useVocabularyCreatorStore()
  if (!wordPack) return
  wordImportState.value = "loading"
  const words: WordItem[] = await importVocabulary(
      importMode.value === VocabImportMode.generate ? generateTopic.value : rawImport.value,
      LANGUAGE_LABELS[wordPack.knownLanguage], LANGUAGE_LABELS[wordPack.learnLanguage], importMode.value, amountOfWords.value)

  if (words.length == 0) {
    wordImportState.value = "input"
    const {showToast} = useAppStore()
    showToast(t('toast.something_wrong'), {color: 'danger'})
    return;
  } else {
    const {wordPack} = useVocabularyCreatorStore()
    wordsToImport.value = words.filter((w1) => !wordPack?.words.some(w2 => areWordsEqual(w1, w2))).map(w => {
      return {from: sanitize_lite(w.from), to: sanitize_lite(w.to)}
    })
    wordImportState.value = "output"
  }

}

function onDelete(index: number) {
  wordsToImport.value = wordsToImport.value.toSpliced(index, 1)
}

function onEdit(word: WordItem, index: number) {
  wordsToImport.value[index] = word
}

function reset() {
  wordsToImport.value = []
  wordImportState.value = "input"
  generateTopic.value = ""
  rawImport.value = ""
  importMode.value = VocabImportMode.raw
  amountOfWords.value = START_IMPORT_AMOUNT
}

function addToWordPack() {
  emits("importWords", wordsToImport.value)
  modalController.dismiss()
}
</script>

<style scoped>

</style>