<template>
  <ion-page class="max-w-[1000px] mx-auto" v-if="wordPack">
    <ion-header>
      <ion-toolbar color="background">
        <div class="flex items-center px-2 h-16">
          <ion-button fill="clear" @click="router.navigate('/home', 'back', 'pop')">
            <ion-icon slot="icon-only" :icon="arrowBack"/>
          </ion-button>
          <p class="text-2xl font-bold pl-2">Practice • {{ wordPack.name }}</p>
        </div>
      </ion-toolbar>

    </ion-header>
    <ion-content>

      <div class="p-4 w-full h-full space-y-3 flex flex-col">
        <ExerciseMethodCard :exercise-method="exerciseMethod" v-for="exerciseMethod in PracticeModes"
                            :key="exerciseMethod.id" @click="() => onPracticeMethodClick(exerciseMethod)"/>
      </div>


    </ion-content>

    <PracticeOptionsModal v-model:isOpen="isPracticeMethodOptionActionSheetOpen"
                          :selectedPracticeMode="selectedPracticeMode"/>


  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonToolbar,
  onIonViewWillEnter,
  useIonRouter,
} from "@ionic/vue";
import ExerciseMethodCard from "@/components/exercises/ExerciseMethodCard.vue";
import {AVG_PRACTICE_WORDS, MIN_PRACTICE_WORDS, PracticeModes} from "@/config/exercises/practiceModes";
import {ref} from "vue";
import {PracticeMode} from "@/types";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
import {useAppStore} from "@/states/app.state";
import {arrowBack} from "ionicons/icons";
import {useI18n} from "vue-i18n";
import PracticeOptionsModal from "@/components/exercises/PracticeOptionsModal.vue";

const router = useIonRouter()
const {t} = useI18n()

const isPracticeMethodOptionActionSheetOpen = ref(false);

const selectedPracticeMode = ref<PracticeMode>();


const {
  wordPack,
  amountOfWords,
  wordsToPractice
} = storeToRefs(useVocabularyPracticeStore())

const {showToast} = useAppStore()


onIonViewWillEnter(() => {
  if (!wordPack.value) return
  wordsToPractice.value = []
  amountOfWords.value = Math.min(wordPack.value.words.length, AVG_PRACTICE_WORDS)
})

function onPracticeMethodClick(practiceMethod: PracticeMode) {
  if (!wordPack.value) return
  selectedPracticeMode.value = practiceMethod;

  if (selectedPracticeMode.value.id === "translation" || selectedPracticeMode.value.id === "multiple-choice") {
    if (wordPack.value.words.length < MIN_PRACTICE_WORDS) {
      showToast(t('toast.need_min_words', {count: MIN_PRACTICE_WORDS - wordPack.value.words.length}), {color: 'warning'});
      return;
    }
    isPracticeMethodOptionActionSheetOpen.value = true;
  } else {
    router.push({
      name: practiceMethod.link,
    });

  }
}


</script>

<style scoped>

</style>