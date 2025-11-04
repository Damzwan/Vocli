<template>
  <ion-page class="max-w-[1000px] mx-auto">
    <ion-header>
      <ion-toolbar color="background" v-if="wordPack">
        <div class="px-2 h-16 flex justify-between items-center">
          <div class="flex items-center">
            <ion-button fill="clear" @click="router.navigate('/home', 'back', 'pop')">
              <ion-icon slot="icon-only" :icon="arrowBack"/>
            </ion-button>
            <ion-input v-model="wordPack.name" class="bg-card-background rounded-lg px-3 py-2"
                       @ionChange="saveWordPack" ref="hackInputEl">
              <div slot="start" class="pl-1"/>
              <ion-icon slot="end" :icon="createOutline" class="px-3"/>
            </ion-input>
          </div>


          <div class="px-1">
            <ion-button fill="clear" id="wordsImporter" size="large">
              <ion-icon slot="icon-only" :icon="addOutline"/>
            </ion-button>
            <WordImporter @importWords="importWords"/>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="flex justify-center items-center bg-background w-full h-full" v-if="!wordPack">
        <ion-spinner color="secondary"/>
      </div>
      <div class="w-full h-full" v-else>

        <div class="bg-card-background rounded-xl p-4 mt-4 mx-3">
          <ion-input :placeholder="t('create.next_word')" v-model="knownLanguageInput" ref="knownLanguageInputEl"
                     @keyup.enter="onInput"
                     class="bg-card-background">
            <ion-icon slot="start" :icon="flipLanguages ? LANGUAGE_FLAGS[wordPack.learnLanguage] : LANGUAGE_FLAGS[wordPack.knownLanguage]" class="px-3"/>
            <ion-spinner color="primary" class="pr-12" slot="end" v-if="translateLoading"/>
            <ion-button slot="end" fill="clear" @click="onInput" v-else :disabled="knownLanguageInput == ''">
              <ion-icon :icon="arrowForwardOutline"/>
            </ion-button>
          </ion-input>

          <ion-button fill="clear" @click="flipLanguages = !flipLanguages" class="-mt-3 -mb-2">
            <ion-icon :icon="swapVerticalOutline" slot="icon-only"/>
          </ion-button>

          <ion-input :placeholder="t('create.auto_translate')" v-model="learnLanguageInput"
                     :disabled="!canEditToInput"
                     ref="learnLanguageInputEl"
                     @keyup.enter="onInput" class="bg-card-background">
            <ion-icon slot="start" :icon="flipLanguages ? LANGUAGE_FLAGS[wordPack.knownLanguage] : LANGUAGE_FLAGS[wordPack.learnLanguage]" class="px-3"/>
            <div slot="end">
              <ion-button slot="end" fill="clear" id="wordAlternativesPopover" :disabled="learnLanguageInput == ''">
                <ion-icon :icon="ellipsisHorizontal"/>
              </ion-button>

              <ion-button slot="end" fill="clear" @click="onInput" :disabled="learnLanguageInput == ''">
                <ion-icon :icon="arrowForwardOutline"/>
              </ion-button>
            </div>
          </ion-input>

        </div>
        <hr class="border-t border-gray-600 mx-4 my-4"/>

        <div class="pb-8 px-3 flex flex-col-reverse -my-2">
          <WordCard
              class="my-2"
              v-for="(wordItem, i) in wordPack.words"
              :key="wordItem.from"
              :wordItem="wordItem"
              @click="() => onWordClick(wordItem, i)"
          />
        </div>


        <WordEditActionSheet v-model:is-open="isWordEditActionSheetOpen" :word-item="wordToEdit" @delete="onWordDelete"
                             @word-edited="(newFrom, newTo) => onWordEdit(newFrom, newTo)"/>

        <ion-popover trigger="wordAlternativesPopover" trigger-action="click" @willPresent="findWordAlternatives">
          <div class="p-2">
            <div class="flex justify-center items-center" v-if="fetchingAlternativeTranslations">
              <ion-spinner color="primary"/>
            </div>
            <div v-else-if="translationAlternatives.length === 0" class="text-center text-gray-400">
              <p>No translations found...</p>
            </div>
            <div v-else>
              <ion-item v-for="translation in translationAlternatives" button
                        @click="selectAlternativeTranslation(translation)">{{ translation }}
              </ion-item>
            </div>
          </div>
        </ion-popover>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import WordEditActionSheet from "@/components/create/WordEditActionSheet.vue";

import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonPage,
  useIonRouter,
  IonSpinner,
  IonPopover,
  IonHeader,
  IonItem, popoverController, IonToolbar,
} from "@ionic/vue";
import {
  addOutline,
  arrowBack,
  arrowForwardOutline,
  createOutline,
  ellipsisHorizontal,
  swapVerticalOutline
} from "ionicons/icons";
import {nextTick, onMounted, ref, watch} from "vue";
import WordCard from "@/components/create/WordCard.vue";
import {useTranslate} from "@/api/translate";
import {WordItem, WordPack} from "@/types";
import {storeToRefs} from "pinia";
import {useVocabularyCreatorStore} from "@/states/vocabulary-creator.state";
import {LANGUAGE_FLAGS} from "@/config/languages.config";
import WordImporter from "@/components/create/WordImporter.vue";
import {sanitize_lite} from "@/helpers/exercises";
import {areWordsEqual} from "@/helpers/create";
import {useAppStore} from "@/states/app.state";
import {Capacitor} from "@capacitor/core";
import {useI18n} from "vue-i18n";
import {Preferences} from "@capacitor/preferences";
import {useAuthStore} from "@/states/auth.state";


const router = useIonRouter()
const {translate, findTranslationAlternatives} = useTranslate()


const knownLanguageInputEl = ref<any>();
const knownLanguageInput = ref("")

const learnLanguageInputEl = ref<any>();
const hackInputEl = ref<any>(); // somehow without
const learnLanguageInput = ref("")

const isWordEditActionSheetOpen = ref<boolean>(false)
const wordToEdit = ref<WordItem>()
const wordToEditIndex = ref<number>(0)

const {wordPack} = storeToRefs(useVocabularyCreatorStore())
const {saveWordPack} = useVocabularyCreatorStore()
const {wordPacksLoading} = storeToRefs(useAuthStore())

const translateLoading = ref(false)
const flipLanguages = ref(false)

let mainTranslation = ""
const translationAlternatives = ref<string[]>([])
const fetchingAlternativeTranslations = ref(false)

const canEditToInput = ref(false)


const {t} = useI18n()


let isInputLocked = false

// Single function to load the saved pack
async function loadSavedWordPack() {
  if (wordPack.value || wordPacksLoading.value) return; // already loaded

  const wordPackId = (await Preferences.get({key: "wordPackId"})).value;
  if (!wordPackId) {
    return router.replace("/home");
  }

  const {wordPacks} = useAuthStore()

  const matching = wordPacks.find(p => p.id === wordPackId);
  if (matching) {
    wordPack.value = matching;
  } else {
    router.replace("/home");
  }
}

// Run once on mount (in case word packs are already loaded)
onMounted(() => {
  loadSavedWordPack();
});

// If word packs are still loading, run again when they finish
watch(wordPacksLoading, (loading) => {
  if (!loading) loadSavedWordPack();
});

// sadly locking is necessary
// since the @keyup.enter event is overridden for the first input on native.
// that is why we use blur, but if you use the button it will call this function 2 times
async function onInput() {
  if (!wordPack.value) return
  if (isInputLocked) return
  isInputLocked = true

  try {
    if (knownLanguageInput.value === "" && learnLanguageInput.value === "") return
    if (learnLanguageInput.value === "") {
      translateLoading.value = true
      const text = await translate(knownLanguageInput.value, flipLanguages.value ? wordPack.value.learnLanguage : wordPack.value.knownLanguage, flipLanguages.value ? wordPack.value.knownLanguage : wordPack.value.learnLanguage)
      translateLoading.value = false
      learnLanguageInput.value = text.toString()
      mainTranslation = learnLanguageInput.value
      canEditToInput.value = true

      setTimeout(() => {
        learnLanguageInputEl.value?.$el.setFocus()
      }, 20)
    } else {
      const potentialWordToAdd: WordItem = {
        from: sanitize_lite(knownLanguageInput.value),
        to: sanitize_lite(learnLanguageInput.value)
      }
      if (flipLanguages.value) {
        const tmp = potentialWordToAdd.from
        potentialWordToAdd.from = potentialWordToAdd.to
        potentialWordToAdd.to = tmp
      }
      if (!wordPack.value.words.some((wordItem) => areWordsEqual(wordItem, potentialWordToAdd))) {
        wordPack.value.words.push(potentialWordToAdd)
        saveWordPack()
      } else {
        const {showToast} = useAppStore()
        showToast(t('toast.word_in_list'), {color: 'danger'})
      }

      hackInputEl.value?.$el.setFocus() // Without this the keyboard will close before focusing again
      learnLanguageInput.value = ""
      knownLanguageInput.value = ""

      // We need a timeout because otherwise the keyup.enter enter event will not work on mobile
      canEditToInput.value = false

      setTimeout(() => {
        knownLanguageInputEl.value?.$el.setFocus()
      }, 10)


    }
  } finally {
    setTimeout(() => {
      isInputLocked = false
    }, 100)
  }
}

async function findWordAlternatives() {
  if (!wordPack.value) return
  fetchingAlternativeTranslations.value = true
  translationAlternatives.value = await findTranslationAlternatives(knownLanguageInput.value, mainTranslation,
      flipLanguages.value ? wordPack.value.learnLanguage : wordPack.value.knownLanguage,
      flipLanguages.value ? wordPack.value.knownLanguage : wordPack.value.learnLanguage)
  fetchingAlternativeTranslations.value = false
}

async function selectAlternativeTranslation(alternativeTranslation: string) {
  if (!wordPack.value) return
  learnLanguageInput.value = alternativeTranslation
  mainTranslation = learnLanguageInput.value
  translationAlternatives.value = []
  await popoverController.dismiss()

  const inputEl = learnLanguageInputEl.value?.$el
  if (inputEl) {
    inputEl.setFocus()
    // Wait a tick to ensure the element is focused before moving the cursor
    requestAnimationFrame(() => {
      const input = inputEl.querySelector('input, textarea')
      if (input) {
        const length = input.value.length
        input.setSelectionRange(length, length)
      }
    })
  }
}


function importWords(importedWordItems: WordItem[]) {
  if (!wordPack.value) return
  wordPack.value.words.push(...importedWordItems) // we assume they are sanitized beforehand
  saveWordPack()
}

function onWordClick(word: WordItem, index: number) {
  wordToEdit.value = word
  wordToEditIndex.value = index

  isWordEditActionSheetOpen.value = true
}

function onWordDelete() {
  if (!wordPack.value) return
  wordPack.value.words = wordPack.value.words.toSpliced(wordToEditIndex.value, 1)
  saveWordPack()
}

function onWordEdit(newFrom: string, newTo: string) {
  if (!wordPack.value) return
  if (wordToEditIndex.value > wordPack.value.words.length) return
  wordPack.value.words[wordToEditIndex.value] = {
    from: newFrom,
    to: newTo,
  }
  wordPack.value.words = [...wordPack.value.words]
  saveWordPack()
}


</script>

<style scoped>

ion-input.hackyInput {
  display: none;
}

</style>