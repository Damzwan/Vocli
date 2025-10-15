<template>
  <ion-page class="max-w-[1000px] mx-auto">
    <ion-content>
      <div class="flex justify-center items-center bg-background w-full h-full" v-if="!wordPack">
        <ion-spinner color="secondary"/>
      </div>
      <div class="w-full h-full" v-else>
        <div class="px-2 h-16 flex justify-between items-center">
          <div class="flex items-center">
            <ion-button fill="clear" @click="router.back()">
              <ion-icon slot="icon-only" :icon="arrowBack"/>
            </ion-button>
            <ion-input v-model="wordPack.name" class="bg-card-background rounded-lg px-3 py-2"
                       @ionChange="saveWordPack">
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


        <div class="bg-card-background rounded-xl p-4 space-y-4 mt-4 mx-3">
          <ion-input :placeholder="t('create.next_word')" v-model="knownLanguageInput"
                     @keyup.enter="() => Capacitor.isNativePlatform() ? undefined : onInput()"
                     @ionBlur="() => Capacitor.isNativePlatform() ? onInput() : undefined" ref="knownLanguageInputEl"
                     class="bg-card-background">
            <ion-icon slot="start" :icon="LANGUAGE_FLAGS[wordPack.knownLanguage]" class="px-3"/>
            <ion-spinner color="primary" class="pr-12" slot="end" v-if="translateLoading"/>
            <ion-button slot="end" fill="clear" @click="onInput" v-else>
              <ion-icon :icon="arrowForwardOutline"/>
            </ion-button>
          </ion-input>

          <ion-input :placeholder="t('create.auto_translate')" v-model="learnLanguageInput"
                     :disabled="learnLanguageInput == ''"
                     ref="learnLanguageInputEl"
                     @keyup.enter="onInput" class="bg-card-background">
            <ion-icon slot="start" :icon="LANGUAGE_FLAGS[wordPack.learnLanguage]" class="px-3"/>
            <ion-button slot="end" fill="clear" @click="onInput">
              <ion-icon :icon="arrowForwardOutline"/>
            </ion-button>
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
} from "@ionic/vue";
import {addOutline, arrowBack, arrowForwardOutline, createOutline} from "ionicons/icons";
import {nextTick, onMounted, ref, watch} from "vue";
import WordCard from "@/components/create/WordCard.vue";
import {useTranslate} from "@/api/translate";
import {WordItem} from "@/types";
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
const {translate} = useTranslate()


const knownLanguageInputEl = ref<any>();
const knownLanguageInput = ref("")

const learnLanguageInputEl = ref<any>();
const learnLanguageInput = ref("")

const isWordEditActionSheetOpen = ref<boolean>(false)
const wordToEdit = ref<WordItem>()
const wordToEditIndex = ref<number>(0)

const {wordPack} = storeToRefs(useVocabularyCreatorStore())
const {saveWordPack} = useVocabularyCreatorStore()
const {wordPacksLoading} = storeToRefs(useAuthStore())

const translateLoading = ref(false)


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
    else if (knownLanguageInput.value === "") {
      translateLoading.value = true
      const text = await translate(learnLanguageInput.value, wordPack.value.learnLanguage, wordPack.value.knownLanguage)
      translateLoading.value = false

      knownLanguageInput.value = text.toString()
      setTimeout(() => {
        knownLanguageInputEl.value?.$el.setFocus()
      }, 20)
    } else if (learnLanguageInput.value === "") {
      translateLoading.value = true
      const text = await translate(knownLanguageInput.value, wordPack.value.knownLanguage, wordPack.value.learnLanguage)
      translateLoading.value = false
      learnLanguageInput.value = text.toString()
      setTimeout(() => {
        learnLanguageInputEl.value?.$el.setFocus()
      }, 20)

    } else {
      const potentialWordToAdd: WordItem = {
        from: sanitize_lite(knownLanguageInput.value),
        to: sanitize_lite(learnLanguageInput.value)
      }
      if (!wordPack.value.words.some((wordItem) => areWordsEqual(wordItem, potentialWordToAdd))) {
        wordPack.value.words.push({
          from: sanitize_lite(knownLanguageInput.value),
          to: sanitize_lite(learnLanguageInput.value)
        })
        saveWordPack()
      } else {
        const {showToast} = useAppStore()
        showToast(t('toast.word_in_list'), {color: 'danger'})
      }

      knownLanguageInput.value = ""
      learnLanguageInput.value = ""
      knownLanguageInputEl.value?.$el.setFocus()
    }
  } finally {
    setTimeout(() => {
      isInputLocked = false
    }, 100)
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


</style>