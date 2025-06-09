<template>
  <ion-page v-if="wordPack" class="max-w-[1000px] mx-auto">
    <ion-content>
      <div class="flex justify-between px-2 h-16 space-x-4 items-center items-center">
        <div class="flex items-center justify-center">
          <ion-button fill="clear" @click="router.back(iosTransitionAnimation)">
            <ion-icon slot="icon-only" :icon="arrowBack"/>
          </ion-button>
          <p class="text-2xl font-bold pl-2">{{ t('list.title') }}</p>
        </div>


        <div class="h-8">
          <div class="flex items-center space-x-2">
            <!-- Search input -->
            <ion-input
                class="bg-card-background rounded-lg"
                size="small"
                v-model="wordToSearch"
                @keyup.enter="scrollToIndex(indicesToHighlight[currentIndexToScrollTo])"
                @ionInput="setHighlighting"
                :clear-input="true"
                :placeholder="t('list.search')"
            >
              <div slot="start" class="pl-1"/>
              <ion-icon slot="end" :icon="searchOutline" class="px-3"/>
            </ion-input>

            <!-- If there are highlights, show controls -->
          </div>
        </div>
      </div>
      <div class="flex w-full justify-end h-4 mt-2">
        <div v-if="indicesToHighlight.length > 0" class="flex items-center">
          <ion-button fill="clear" @click="prevMatch">
            <ion-icon :icon="chevronBackOutline"/>
          </ion-button>

          <span class="text-white text-sm">
      {{ currentIndexToScrollTo + 1 }} / {{ indicesToHighlight.length }}
              </span>

          <ion-button fill="clear" @click="nextMatch"
          >
            <ion-icon :icon="chevronForwardOutline"/>
          </ion-button>
        </div>
      </div>

      <div class="flex flex-col h-full p-4 space-y-4">
        <div class="flex justify-center items-center space-x-4">
          <div class="w-full justify-center flex">
            <ion-button fill="clear" class="text-white" size="large" @click="hideLeft=!hideLeft">
              <ion-icon slot="icon-only" :icon="hideLeft ? eyeOffOutline : eyeOutline"/>
            </ion-button>
          </div>
          <div class="w-full justify-center flex">
            <ion-button fill="clear" class="text-white" size="large" @click="hideRight=!hideRight">
              <ion-icon slot="icon-only" :icon="hideRight ? eyeOffOutline : eyeOutline"/>
            </ion-button>
          </div>


        </div>

        <div class="flex-1 overflow-y-auto space-y-4">
          <ListWordCard
              v-for="(word, i) in wordPack.words"
              :key="word.from"
              :id="`word-${i}`"
              :word-item="word"
              :hideLeft="hideLeft"
              :hide-right="hideRight"
              :highlighted-word="indicesToHighlight.includes(i) ? wordToSearch : undefined"
          />
        </div>
      </div>
    </ion-content>


  </ion-page>
</template>

<script setup lang="ts">

import {IonButton, IonContent, IonIcon, IonInput, IonPage, iosTransitionAnimation, useIonRouter} from "@ionic/vue";
import {
  arrowBack,
  chevronBackOutline,
  chevronForwardOutline,
  eyeOffOutline,
  eyeOutline,
  searchOutline
} from "ionicons/icons";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
import ListWordCard from "@/components/exercises/ListWordCard.vue";
import {ref} from "vue";
import {sanitize} from "@/helpers/exercises";
import {useI18n} from "vue-i18n";

const router = useIonRouter()

const hideLeft = ref(false);
const hideRight = ref(false);


const {wordPack} = storeToRefs(useVocabularyPracticeStore())
const {t} = useI18n()

const wordToSearch = ref("");
const indicesToHighlight = ref<number[]>([]);
const currentIndexToScrollTo = ref(0);

function setHighlighting() {
  if (wordToSearch.value.length <= 2 || !wordPack.value) {
    indicesToHighlight.value = [];
    return;
  }


  const search = sanitize(wordToSearch.value)

  indicesToHighlight.value = wordPack.value.words.reduce<number[]>((indices, word, index) => {
    const from = sanitize(word.from);
    const to = sanitize(word.to);

    if (from.includes(search) || to.includes(search)) {
      indices.push(index);
    }

    return indices;
  }, []);
  currentIndexToScrollTo.value = 0

}

function scrollToIndex(index: number) {
  document.getElementById(`word-${index}`)?.scrollIntoView({behavior: "smooth", block: "center"});
}

function nextMatch() {
  currentIndexToScrollTo.value = (currentIndexToScrollTo.value + 1) % indicesToHighlight.value.length;
  scrollToIndex(indicesToHighlight.value[currentIndexToScrollTo.value]);
}

function prevMatch() {
  currentIndexToScrollTo.value--;
  if (currentIndexToScrollTo.value < 0) currentIndexToScrollTo.value = indicesToHighlight.value.length - 1;
  scrollToIndex(indicesToHighlight.value[currentIndexToScrollTo.value]);

}

</script>

<style scoped>

</style>