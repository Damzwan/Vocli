<template>
  <ion-page class="max-w-[1000px] mx-auto" v-if="wordPack">
    <ion-content>
      <div class="flex items-center px-2 h-16">
        <ion-button fill="clear" @click="router.back(iosTransitionAnimation)">
          <ion-icon slot="icon-only" :icon="arrowBack"/>
        </ion-button>
        <p class="text-2xl font-bold pl-2">{{ t(`${tPrefix}.title`) }}</p>
      </div>
      <div class="p-4 w-full h-full space-y-3 flex flex-col">
        <ExerciseMethodCard :exercise-method="exerciseMethod" v-for="exerciseMethod in PRACTICE_MODES"
                            :key="exerciseMethod.id" @click="() => onPracticeMethodClick(exerciseMethod)"/>
      </div>

      <ion-modal
          :is-open="isPracticeMethodOptionActionSheetOpen"
          :initial-breakpoint="1"
          :breakpoints="[0, 1]"
          @didDismiss="isPracticeMethodOptionActionSheetOpen = false"
      >
        <div class="p-4 bg-zinc-900 text-zinc-200 space-y-6 rounded-t-2xl">
          <!-- Title -->
          <h2 class="text-2xl font-semibold text-white text-center">{{ t(`${tPrefix}.options`) }}</h2>

          <!-- Practice direction -->
          <div class="space-y-2">
            <p class="text-2xl text-zinc-400 text-center">{{ t(`${tPrefix}.order`) }}</p>
            <div class="w-full flex justify-center items-center space-x-4 py-1">
              <ion-chip
                  :class="{'bg-primary': practiceOrder == PracticeOrder.knownToLearn}"
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
                  :class="{'bg-primary': practiceOrder == PracticeOrder.learnToKnown}"
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

          <!-- Word amount selector -->
          <div class="space-y-2 px-4">
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

          <!-- Start button -->
          <ion-button expand="block" shape="round" class="mt-4 text-white" @click="startTranslateExercise">
            {{ t(`${tPrefix}.start`) }}
          </ion-button>
        </div>
      </ion-modal>
    </ion-content>


  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonModal,
  IonPage,
  IonRange,
  iosTransitionAnimation,
  onIonViewWillEnter,
  useIonRouter,
} from "@ionic/vue";
import ExerciseMethodCard from "@/components/exercises/ExerciseMethodCard.vue";
import {AVG_PRACTICE_WORDS, MIN_PRACTICE_WORDS, PRACTICE_MODES} from "@/config/exercises/PRACTICE_MODES";
import {ref} from "vue";
import {PracticeMode, PracticeOrder} from "@/types";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
import {useAppStore} from "@/states/app.state";
import {arrowBack} from "ionicons/icons";
import {LANGUAGE_FLAGS} from "@/config/languages.config";
import {useI18n} from "vue-i18n";

const router = useIonRouter()
const {t} = useI18n()
const tPrefix = "practice_methods"


const isPracticeMethodOptionActionSheetOpen = ref(false);
const selectedPracticeMode = ref<PracticeMode>();

const {wordPack, amountOfWords, practiceOrder} = storeToRefs(useVocabularyPracticeStore())
const {showToast} = useAppStore()

onIonViewWillEnter(() => {
  if (!wordPack.value) return
  amountOfWords.value = Math.min(wordPack.value.words.length, AVG_PRACTICE_WORDS)
})

function onPracticeMethodClick(practiceMethod: PracticeMode) {
  if (!wordPack.value) return
  selectedPracticeMode.value = practiceMethod;

  if (selectedPracticeMode.value.id === "translation" || selectedPracticeMode.value.id === "multiple-choice") {
    if (wordPack.value.words.length < MIN_PRACTICE_WORDS) {
      showToast(t('toast.need_min_words', {count: MIN_PRACTICE_WORDS - wordPack.value.words.length}),{color: 'warning'});
      return;
    }
    isPracticeMethodOptionActionSheetOpen.value = true;
  } else {
    router.push(`/practice/${practiceMethod.link}`, iosTransitionAnimation)
  }
}

function startTranslateExercise() {
  if (!selectedPracticeMode.value) return
  isPracticeMethodOptionActionSheetOpen.value = false;
  router.push(`/practice/${selectedPracticeMode.value.link}`, iosTransitionAnimation)

}


</script>

<style scoped>
ion-modal {
  --height: auto;
}
</style>