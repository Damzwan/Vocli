<template>
  <ion-modal
      class="practiceOptionsModal"
      :is-open="isOpen"
      @didDismiss="isOpen = false"
      :initial-breakpoint="1"
      :breakpoints="[0, 1]"
  >
    <div class="p-4 bg-zinc-900 text-zinc-200 space-y-6 rounded-t-2xl" v-if="wordPack">
      <!-- Title -->
      <h2 class="text-2xl font-semibold text-white text-center">{{ t(`${tPrefix}.options`) }}</h2>

      <!-- Practice direction -->
      <div class="space-y-2">
        <p class="text-2xl text-zinc-400 text-center">{{ t(`${tPrefix}.order`) }}</p>
        <div class="w-full flex justify-center items-center space-x-4 py-1">
          <ion-chip
              :class="{'bg-secondary': practiceOrder == PracticeOrder.knownToLearn}"
              @click="practiceOrder = PracticeOrder.knownToLearn"
              class="rounded-xl"
          >
            <div class="flex items-center space-x-2 p-1">
              <img :src="LANGUAGE_FLAGS[wordPack.knownLanguage]" alt="EN"
                   class="w-6 h-6 rounded-full object-cover"/>
              <span class="text-lg">→</span>
              <img :src="LANGUAGE_FLAGS[wordPack.learnLanguage]" alt="IT"
                   class="w-6 h-6 rounded-full object-cover"/>
            </div>
          </ion-chip>
          <ion-chip
              :class="{'bg-secondary': practiceOrder == PracticeOrder.learnToKnown}"
              @click="practiceOrder = PracticeOrder.learnToKnown"
              class="rounded-xl"
          >
            <div class="flex items-center space-x-2 p-1">
              <img :src="LANGUAGE_FLAGS[wordPack.learnLanguage]" alt="IT"
                   class="w-6 h-6 rounded-full object-cover"/>
              <span class="text-lg">→</span>
              <img :src="LANGUAGE_FLAGS[wordPack.knownLanguage]" alt="EN"
                   class="w-6 h-6 rounded-full object-cover"/>
            </div>
          </ion-chip>
        </div>
      </div>

      <!-- Word Selection -->
      <div class="space-y-2">
        <p class="text-2xl text-zinc-400 text-center">{{ t(`${tPrefix}.wordSelection`) }}</p>
        <div class="w-full flex justify-center items-center space-x-4 py-1">
          <ion-chip
              :class="{'bg-secondary': wordSelectionStrategy == WordSelectionStrategy.handPicked}"
              @click="() => {
                    wordSelectionStrategy = WordSelectionStrategy.handPicked
                    wordPickModalOpen = true
                  }"
              class="rounded-xl p-2"
          >
            <p class="mr-2">Select</p>
            <ion-icon :icon="handLeftOutline"/>
            <p class="ml-2" v-if="wordSelectionStrategy === WordSelectionStrategy.handPicked">({{
                wordsToPractice.length
              }})</p>
          </ion-chip>

          <ion-chip
              :class="{'bg-secondary': wordSelectionStrategy == WordSelectionStrategy.random}"
              @click="wordSelectionStrategy = WordSelectionStrategy.random"
              class="rounded-xl p-2"
          >
            <p class="mr-2">Random</p>
            <ion-icon :icon="shuffleOutline"/>
          </ion-chip>

          <ion-chip
              :class="{'bg-secondary': wordSelectionStrategy == WordSelectionStrategy.all}"
              @click="wordSelectionStrategy = WordSelectionStrategy.all"
              class="rounded-xl p-2"
          >
            <p class="mr-2">All</p>
            <ion-icon :icon="shuffleOutline"/>
          </ion-chip>

        </div>
      </div>

      <!-- Word amount selector -->
      <div class="space-y-2 px-4" v-if="wordSelectionStrategy === WordSelectionStrategy.random">
        <p class="text-2xl text-zinc-400 text-center">
          {{ t(`${tPrefix}.amount`) }}
          <span class="font-semibold text-white text-3xl">{{ amountOfWords }}</span>
        </p>
        <ion-range
            @ionInput="(ev) => amountOfWords = (ev.detail.value as number)"
            :min="MIN_PRACTICE_WORDS"
            :max="wordPack.words.length"
            :value="amountOfWords"
            class="w-full"
        />
      </div>

      <p class="mx-auto text-center text-red-500"
         v-if="wordSelectionStrategy === WordSelectionStrategy.handPicked && wordsToPractice.length < MIN_PRACTICE_WORDS">
        Please select at least {{ MIN_PRACTICE_WORDS }} words</p>

      <!-- Start button -->
      <ion-button expand="block" shape="round" class="mt-4 text-white" @click="startTranslateExercise"
                  :disabled="wordSelectionStrategy === WordSelectionStrategy.handPicked && wordsToPractice.length < MIN_PRACTICE_WORDS"
                  color="secondary">
        {{ t(`${tPrefix}.start`) }}
      </ion-button>
    </div>
  </ion-modal>
  <PickWordsToPracticeModal v-model:isOpen="wordPickModalOpen"/>
</template>

<script setup lang="ts">
import {IonButton, IonChip, IonIcon, IonModal, IonRange, useIonRouter} from "@ionic/vue";
import {useI18n} from "vue-i18n";
import {MIN_PRACTICE_WORDS} from "@/config/exercises/practiceModes";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
import {PracticeMode, PracticeOrder, WordSelectionStrategy} from "@/types";
import {handLeftOutline, shuffleOutline} from "ionicons/icons";
import {LANGUAGE_FLAGS} from "@/config/languages.config";
import PickWordsToPracticeModal from "@/components/exercises/PickWordsToPracticeModal.vue";
import {ref} from "vue";

const router = useIonRouter()
const {t} = useI18n()
const tPrefix = "practice_methods"

const isOpen = defineModel<boolean>('isOpen', {default: false})
const props = defineProps<{
  selectedPracticeMode: PracticeMode | undefined;
}>()

const wordPickModalOpen = ref(false);

const {
  wordPack,
  amountOfWords,
  practiceOrder,
  wordSelectionStrategy,
  wordsToPractice,
} = storeToRefs(useVocabularyPracticeStore())


function startTranslateExercise() {
  if (!props.selectedPracticeMode) return
  isOpen.value = false;
  router.push({
    name: props.selectedPracticeMode.link,
  });

}

</script>

<style>
.practiceOptionsModal {
  --height: auto;
}
</style>

