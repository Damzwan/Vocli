<template>
  <ion-modal
      @willPresent="reset"
      :is-open="isOpen"
      @didDismiss="isOpen=false"
      :initial-breakpoint="0.3"
      :breakpoints="[0, 0.3, 0.6, 0.75]"
      :expand-to-scroll="false"
  >
    <ion-content>
      <div v-if="wordPack" class="p-4">
        <!-- Loading -->
        <div v-if="wordImportState == 'loading'" class="w-full h-56 flex justify-center items-center">
          <ion-spinner color="primary" size="lg"/>
        </div>

        <!-- Select Method -->
        <div v-else-if="wordImportState == 'selectMethod'">
          <p class="text-2xl">Select import method</p>
          <div class="w-full flex justify-center items-center space-x-4 mt-4">
            <ImportMethodCard
                @click="() => method.id == VocabImportMode.raw ? wordImportState = 'rawMethod' : wordImportState = 'subjectMethod'"
                v-for="method in importMethods" :import-method="method" :key="method.id"/>
          </div>
        </div>

        <!-- Raw Method -->
        <div v-else-if="wordImportState == 'rawMethod'" class="flex flex-col">
          <div class="w-full flex items-center justify-start">
            <ion-button fill="clear" @click="reset">
              <ion-icon slot="icon-only" :icon="arrowBackOutline"/>
            </ion-button>
            <p class="text-2xl">Raw Text</p>
          </div>
          <p class="text-zinc-400 text-left">
            {{ MAX_RAW_IMPORT_AMOUNT - rawAllowedRemainingWord }} / {{ MAX_RAW_IMPORT_AMOUNT }}
          </p>

          <ion-textarea
              v-model="rawImport"
              :placeholder="`Enter words in ${t(`languages.${wordPack.learnLanguage}`)} or ${t(`languages.${wordPack.knownLanguage}`)}, separated by commas or newlines.`"
              :auto-grow="true"
              :rows="7"
              :maxLength="CHARACTER_LIMIT"
              counter
              class="bg-card-background rounded-lg text-white px-4 mt-2"
              @keydown="onRawEnter"
          />

          <ion-button expand="block" @click="onRawGenerateClick" class="mt-6 mx-4"
                      :disabled="MAX_RAW_IMPORT_AMOUNT - rawAllowedRemainingWord === 0">
            {{ t(`${tPrefix}.import_words`) }} ({{ MAX_RAW_IMPORT_AMOUNT - rawAllowedRemainingWord }})
          </ion-button>
        </div>

        <!-- Subject Method -->
        <div v-else-if="wordImportState == 'subjectMethod'" class="flex flex-col">
          <div class="w-full flex items-center justify-start">
            <ion-button fill="clear" @click="reset">
              <ion-icon slot="icon-only" :icon="arrowBackOutline"/>
            </ion-button>
            <p class="text-2xl">Subject</p>
          </div>

          <ion-textarea
              v-model="generateTopic"
              :placeholder="t(`${tPrefix}.topic_placeholder`)"
              :auto-grow="true"
              :maxLength="CHARACTER_LIMIT"
              counter
              class="bg-card-background rounded-lg text-white px-4 mt-2"
              @keydown="onSubjectEnter"
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

          <ion-button expand="block" @click="onSubjectGenerateClick" class="mt-6 mx-4"
                      :disabled="generateTopic.length == 0">
            {{ t(`${tPrefix}.import_words`) }} ({{ amountOfWords }})
          </ion-button>
        </div>

        <!-- Output -->
        <div v-else-if="wordImportState == 'output'" class="flex flex-col h-full relative">
          <p class="text-2xl">Generated words ({{ wordsToImport.length }})</p>

          <div class="flex flex-col space-y-3 pb-12 overflow-y-auto grow mt-4">
            <WordToImportCard
                :word-item="word"
                :key="word.from"
                v-for="(word, i) in wordsToImport"
                @onDelete="() => onDelete(i)"
                @onEdit="(newWord) => onEdit(newWord, i)"
            />
          </div>

          <!-- Sticky button at the bottom, centered -->
          <div class="fixed wf bottom-4 left-1/2 transform -translate-x-1/2">
            <ion-button @click="addToWordPack">
              {{ t(`${tPrefix}.add`) }} ({{ wordsToImport.length }})
            </ion-button>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-modal>

</template>

<script setup lang="ts">


import {ImportMethod, VocabImportMode, WordItem} from "@/types";
import {IonButton, IonIcon, IonModal, IonTextarea, modalController, IonContent, IonRange, IonSpinner} from "@ionic/vue";
import {computed, ref, watch} from "vue";
import {useLLM} from "@/api/llm";
import {useVocabularyCreatorStore} from "@/states/vocabulary-creator.state";
import {LANGUAGE_LABELS} from "@/config/languages.config";
import {useAppStore} from "@/states/app.state";
import {sanitize_lite} from "@/helpers/exercises";
import {areWordsEqual} from "@/helpers/create";
import {useI18n} from "vue-i18n";
import ImportMethodCard from "@/components/create/ImportMethodCard.vue";
import {arrowBackOutline} from "ionicons/icons";
import {storeToRefs} from "pinia";
import WordToImportCard from "@/components/create/WordToImportCard.vue";

type WordImportState = "selectMethod" | "rawMethod" | 'subjectMethod' | "loading" | 'output'


const CHARACTER_LIMIT = 300
const MAX_RAW_IMPORT_AMOUNT = 20

const MIN_IMPORT_AMOUNT = 5
const MAX_IMPORT_AMOUNT = 30
const START_IMPORT_AMOUNT = 10

const generateTopic = ref("")
const rawImport = ref("")
const wordImportState = ref<WordImportState>("selectMethod")
const {importVocabulary} = useLLM()

const wordsToImport = ref<WordItem[]>([])
const amountOfWords = ref<number>(START_IMPORT_AMOUNT)

const {t} = useI18n()
const tPrefix = "create.wordsImporter"

const {wordPack} = storeToRefs(useVocabularyCreatorStore())

const isOpen = defineModel<boolean>('isOpen', {default: false})

const importMethods = ref<ImportMethod[]>([{
  title: 'Raw Text',
  subtitle: 'Extract words from pasted text.',
  icon: '📝',
  color: '#F5A97F',
  id: VocabImportMode.raw
},
  {
    title: 'Subject',
    subtitle: 'Generate words by topic.',
    icon: '🧠',
    color: '#F28FAD',
    id: VocabImportMode.subject
  },])

const emits = defineEmits<{
  (e: 'importWords', words: WordItem[]): void
}>()

watch(wordImportState, async (newVal) => {
  const modal = await modalController.getTop();
  if (!modal) return
  if (newVal == "selectMethod") await modal.setCurrentBreakpoint(0.3)
  else if (newVal == "loading") await modal.setCurrentBreakpoint(0.3)
  else if (newVal == "rawMethod") await modal.setCurrentBreakpoint(0.6)
  else if (newVal == "subjectMethod") await modal.setCurrentBreakpoint(0.6)
  else if (newVal == "output") await modal.setCurrentBreakpoint(0.75)
})

watch(rawImport, (newVal) => {
  const words = newVal.split(/[\s,]+/).filter(Boolean);
  if (words.length > MAX_RAW_IMPORT_AMOUNT) {
    rawImport.value = words.slice(0, MAX_RAW_IMPORT_AMOUNT).join(', ');
  }
});
const rawAllowedRemainingWord = computed(() => {
  const words = rawImport.value.split(/[\s,]+/).filter(Boolean)
  return MAX_RAW_IMPORT_AMOUNT - words.length
})

function onRawEnter(event: KeyboardEvent) {
  if (MAX_RAW_IMPORT_AMOUNT - rawAllowedRemainingWord.value === 0) return
  if (event.key === "Enter") {
    if (event.metaKey || event.ctrlKey) {
      event.preventDefault() // prevent newline insertion
      onRawGenerateClick()
    }
  }
}

function onSubjectEnter(event: KeyboardEvent) {
  if (generateTopic.value === '') return
  if (event.key === "Enter") {
    if (event.metaKey || event.ctrlKey) {
      event.preventDefault() // prevent newline insertion
      onSubjectGenerateClick()
    }
  }
}


async function onRawGenerateClick() {
  if (!wordPack.value) return
  wordImportState.value = "loading"
  const words: WordItem[] = await importVocabulary(
      rawImport.value, LANGUAGE_LABELS[wordPack.value.knownLanguage], LANGUAGE_LABELS[wordPack.value.learnLanguage], VocabImportMode.raw, amountOfWords.value)
  onWordsGenerated(words)
}

async function onSubjectGenerateClick() {
  if (!wordPack.value) return
  wordImportState.value = "loading"
  const words: WordItem[] = await importVocabulary(
      generateTopic.value, LANGUAGE_LABELS[wordPack.value.knownLanguage], LANGUAGE_LABELS[wordPack.value.learnLanguage], VocabImportMode.subject, amountOfWords.value)
  onWordsGenerated(words)
}

function onWordsGenerated(words: WordItem[]) {
  if (words.length == 0) {
    wordImportState.value = "selectMethod"
    const {showToast} = useAppStore()
    showToast(t('toast.something_wrong'), {color: 'danger'})
    return;
  } else {
    wordsToImport.value = words.filter((w1) => !wordPack.value?.words.some(w2 => areWordsEqual(w1, w2))).map(w => {
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
  wordImportState.value = "selectMethod"
  generateTopic.value = ""
  rawImport.value = ""
  amountOfWords.value = START_IMPORT_AMOUNT
}

function addToWordPack() {
  emits("importWords", wordsToImport.value)
  modalController.dismiss()
}
</script>

<style scoped>


</style>