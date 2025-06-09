<template>
  <ion-page class="max-w-[1000px] mx-auto">
    <ion-content>
      <div class="flex items-center px-2 h-16">
        <p class="text-2xl font-bold pl-2">{{t('stats.title')}}</p>
      </div>
      <div class="p-4 flex flex-col h-full">

        <!-- Emoji -->
        <div class="h-16 w-full flex justify-between items-center mb-6">
          <p
              v-if="showEmoji"
              class="mx-auto text-6xl animate-in animate-jump-in animate-ease-out"
          >
            {{ emojiToShow }}
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 h-[200px] overflow-y-auto mb-4">
          <StatsCard
              v-for="(stat, index) in stats.filter(stat => stat.show)"
              :key="stat.title"
              :title="stat.title"
              :description="stat.description"
              :icon="stat.icon"
              :color="stat.color"
              :style="{ animationDelay: `${index * 100}ms` }"
              class="animate-fade-up animate-ease-out"
          />
        </div>

        <!-- Scrollable Mistake Section -->
        <div class="flex-1 min-h-0 overflow-y-auto mb-6 animate-fade-up animate-ease-out"
             v-if="wrongWords.length > 0 && showMistakes">
          <p class="text-xl font-bold">{{t('stats.words_to_review')}} ({{ wrongWords.length }}):</p>
          <div class="flex flex-col space-y-3 pt-4">
            <MistakeCard
                :word-item="wrongWord"
                v-for="wrongWord in wrongWords"
                :key="wrongWord.from"
            />
          </div>
        </div>
        <div class="flex-1 min-h-0 mb-6" v-else/>


        <!-- Fixed Buttons at the bottom -->
        <div class="space-y-3 flex flex-col justify-center">
          <ion-button class="mb-3" color="secondary" @click="onTryAgain">{{t('stats.again')}}</ion-button>
          <ion-button class="mb-3" fill="outline" color="secondary" @click="router.replace('/practice')">
            {{t('stats.different_exercise')}}
          </ion-button>
          <ion-button fill="clear" color="secondary" @click="router.replace('/home')">{{t('stats.home')}}</ion-button>
        </div>

      </div>
    </ion-content>


  </ion-page>
</template>

<script setup lang="ts">
import {IonButton, IonContent, IonPage, onIonViewDidEnter, useIonRouter} from "@ionic/vue";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
import StatsCard from "@/components/exercises/StatsCard.vue";
import {
  alertCircleOutline,
  checkmarkOutline,
  closeCircleOutline,
  helpCircleOutline,
  textOutline,
  timeOutline
} from "ionicons/icons";
import MistakeCard from "@/components/exercises/MistakeCard.vue";
import dayjs from 'dayjs';
import {PRACTICE_MODES} from "@/config/exercises/PRACTICE_MODES";
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";


const {
  amountOfWords,
  wrongWords,
  wordsSkipped,
  hintsUsed,
  practiceTime,
  practiceMethodName
} = storeToRefs(useVocabularyPracticeStore())

const {t} = useI18n()


const mistakesMade = computed(() => wrongWords.value.reduce((acc, word) => acc + (word.mistakes ? word.mistakes.length : 0), 0))
const correctFirstTimeRatio = computed(() => (amountOfWords.value - wrongWords.value.length) / amountOfWords.value)

const showMistakes = ref(false)
const showEmoji = ref(false)

onIonViewDidEnter(() => {
  setTimeout(() => showMistakes.value = true, 300)
  setTimeout(() => showEmoji.value = true, 2000)
})


const emojiToShow = computed(() => {
  if (correctFirstTimeRatio.value < 0.5) return "😭"
  else if (correctFirstTimeRatio.value < 0.7) return "🤐"
  else return "😎"
})

const router = useIonRouter()
const stats = [
  {
    title: `${(correctFirstTimeRatio.value * 100).toFixed(0).toString()}%`,
    description: t("stats.correct_first_try"),
    icon: checkmarkOutline,
    color: '#4CAF50', // green for success
    show: true
  },
  {
    title: amountOfWords.value.toLocaleString(),
    description: t("stats.words_practiced"),
    icon: textOutline,
    color: '#2196F3', // blue for general info
    show: true
  },
  {
    title: mistakesMade.value.toLocaleString(),
    description: t("stats.mistakes_made"),
    icon: alertCircleOutline,
    color: '#F44336', // red for errors
    show: true
  },
  {
    title: formatPracticeTime(practiceTime.value),
    description: t("stats.time_spent"),
    icon: timeOutline,
    color: '#009688', // teal for time/activity
    show: true
  },
  {
    title: wordsSkipped.value.toString(),
    description: t("stats.words_skipped"),
    icon: closeCircleOutline,
    color: '#FFC107', // amber/yellow for skipped
    show: practiceMethodName.value === 'translation'
  },
  {
    title: hintsUsed.value.toString(),
    description: t("stats.hints_used"),
    icon: helpCircleOutline,
    color: '#FF9800', // orange for assistance
    show: practiceMethodName.value === 'translation'
  }
]

function formatPracticeTime(ms: number): string {
  const d = dayjs.duration(ms);
  if (d.days() > 0) {
    return `${d.days()}d ${d.hours()}h ${d.minutes()}m`;
  } else if (d.hours() > 0) {
    return `${d.hours()}h ${d.minutes()}m ${d.seconds()}s`;
  } else if (d.minutes() > 0) {
    return `${d.minutes()}m ${d.seconds()}s`;
  } else {
    return `${d.seconds()}s`;
  }
}

function onTryAgain() {
  const practiceMethod = PRACTICE_MODES.find(el => el.id == practiceMethodName.value)
  if (!practiceMethod) return
  router.replace(`/practice/${practiceMethod.link}?retry=true`)
}
</script>

<style scoped>

</style>