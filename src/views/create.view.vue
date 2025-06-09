<template>
  <ion-page class="max-w-[1000px] mx-auto">
    <ion-content>
      <div class="px-2 h-16 flex justify-between items-center">
        <div class="flex items-center">
          <ion-button fill="clear" @click="router.back(iosTransitionAnimation)">
            <ion-icon slot="icon-only" :icon="arrowBack"/>
          </ion-button>
          <ion-input v-model="name" class="bg-card-background rounded-lg px-3 py-2" @ionChange="saveWordPack">
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
          <ion-icon slot="start" :icon="LANGUAGE_FLAGS[knownLanguage]" class="px-3"/>
          <ion-button slot="end" fill="clear" @click="onInput">
            <ion-icon :icon="arrowForwardOutline"/>
          </ion-button>
        </ion-input>

        <ion-input :placeholder="t('create.auto_translate')" v-model="learnLanguageInput"
                   ref="learnLanguageInputEl"
                   @keyup.enter="onInput" class="bg-card-background">
          <ion-icon slot="start" :icon="LANGUAGE_FLAGS[learnLanguage]" class="px-3"/>
          <ion-button slot="end" fill="clear" @click="onInput">
            <ion-icon :icon="arrowForwardOutline"/>
          </ion-button>
        </ion-input>
      </div>
      <hr class="border-t border-gray-600 mx-4 my-4"/>

      <div class="pb-8 px-3 flex flex-col-reverse">
        <WordCard
            class="my-2"
            v-for="(wordItem, i) in wordItems"
            :key="wordItem.from"
            :wordItem="wordItem"
            @click="() => onWordClick(wordItem, i)"
        />
      </div>


      <WordEditActionSheet v-model:is-open="isWordEditActionSheetOpen" :word-item="wordToEdit" @delete="onWordDelete"
                           @word-edited="(newFrom, newTo) => onWordEdit(newFrom, newTo)"/>
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
  iosTransitionAnimation,
  onIonViewWillEnter,
  useIonRouter
} from "@ionic/vue";
import {addOutline, arrowBack, arrowForwardOutline, createOutline} from "ionicons/icons";
import {ref} from "vue";
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


const router = useIonRouter()
const {translate} = useTranslate()


const knownLanguageInputEl = ref<any>();
const knownLanguageInput = ref("")

const learnLanguageInputEl = ref<any>();
const learnLanguageInput = ref("")

const isWordEditActionSheetOpen = ref<boolean>(false)
const wordToEdit = ref<WordItem>()
const wordToEditIndex = ref<number>(0)


const {name, wordItems, learnLanguage, knownLanguage} = storeToRefs(useVocabularyCreatorStore())
const {retrieveCurrentWordPark, saveWordPack} = useVocabularyCreatorStore()

const {t} = useI18n()

onIonViewWillEnter(() => {
  retrieveCurrentWordPark()
})


let isInputLocked = false

// sadly locking is necessary
// since the @keyup.enter event is overridden for the first input on native.
// that is why we use blur, but if you use the button it will call this function 2 times
async function onInput() {
  if (isInputLocked) return
  isInputLocked = true

  try {
    if (knownLanguageInput.value === "" && learnLanguageInput.value === "") return
    else if (knownLanguageInput.value === "") {
      const text = await translate(learnLanguageInput.value, learnLanguage.value, knownLanguage.value)
      knownLanguageInput.value = text.toString()
      knownLanguageInputEl.value?.$el.setFocus()
    } else if (learnLanguageInput.value === "") {
      const text = await translate(knownLanguageInput.value, knownLanguage.value, learnLanguage.value)
      learnLanguageInput.value = text.toString()
      learnLanguageInputEl.value?.$el.setFocus()
    } else {
      const potentialWordToAdd: WordItem = {
        from: sanitize_lite(knownLanguageInput.value),
        to: sanitize_lite(learnLanguageInput.value)
      }
      if (!wordItems.value.some((wordItem) => areWordsEqual(wordItem, potentialWordToAdd))) {
        wordItems.value.push({
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
  wordItems.value.push(...importedWordItems) // we assume they are sanitized beforehand
  saveWordPack()
}

function onWordClick(word: WordItem, index: number) {
  wordToEdit.value = word
  wordToEditIndex.value = index

  isWordEditActionSheetOpen.value = true
}

function onWordDelete() {
  wordItems.value = wordItems.value.toSpliced(wordToEditIndex.value, 1)
  saveWordPack()
}

function onWordEdit(newFrom: string, newTo: string) {
  if (wordToEditIndex.value > wordItems.value.length) return
  wordItems.value[wordToEditIndex.value] = {
    from: newFrom,
    to: newTo,
  }
  wordItems.value = [...wordItems.value]
  saveWordPack()
}

</script>

<style scoped>
@import "tailwindcss";


</style>