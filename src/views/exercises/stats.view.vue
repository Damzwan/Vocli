<template>
  <ion-page class="max-w-[1000px] mx-auto" v-if="wordPack">
    <ion-header>
      <ion-toolbar color="background">
        <div class="flex items-center justify-start">
          <ion-button fill="clear" @click="router.back()">
            <ion-icon slot="icon-only" :icon="arrowBack"/>
          </ion-button>
          <p class="text-2xl font-bold pl-2">{{ t('stats.title') }}</p>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content>

      <div class="p-4 flex flex-col h-full">
        <div ref="container" class="w-full mb-10 flex justify-center items-center relative">
          <p class="absolute bottom-0 text-3xl" :class="{'animate-jump': showLottie}" :style="{color: scoreColor}">{{
              scoreText
            }}</p>
          <p class="absolute -bottom-6 animate-fade animate-delay-1000" v-if="showLottie">Correct on first attempt</p>
          <dotlottie-wc :src="lottieToShow.img" autoplay="true"
                        loop="true" v-show="showLottie" class="absolute animate-fade"
                        :style="{height: lottieToShow.size + 'px'}"/>

        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4  mb-4">
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

        <div class="flex-1 min-h-0 overflow-y-auto mb-6 animate-fade-up animate-ease-out"
             v-if="wrongWords.length > 0 && showMistakes">
          <p class="text-xl font-bold">{{ t('stats.words_to_review') }} ({{ wrongWords.length }}):</p>
          <div class="flex flex-col space-y-3 pt-4">
            <MistakeCard
                :word-item="wrongWord"
                v-for="wrongWord in wrongWords"
                :key="wrongWord.from"
                :practiceOrder="practiceOrder"
                @open-word-info="open({learnWord: wrongWord.to, knownWord: wrongWord.from, knownLanguage:  wordPack.knownLanguage
                , learnLanguage: wordPack.learnLanguage })"
                @play-tts="(word) => playTTS(word, wordPack!.learnLanguage)"
            />
          </div>
        </div>
        <div class="flex-1 min-h-0 mb-6" v-else/>


        <!-- Fixed Buttons at the bottom -->
        <div class="space-y-3 flex flex-col justify-center">
          <ion-button class="mb-3" color="secondary" @click="onTryAgain">{{ t('stats.again') }}</ion-button>
          <ion-button class="mb-3" fill="outline" color="secondary" @click="router.back()">
            {{ t('stats.different_exercise') }}
          </ion-button>
          <ion-button fill="clear" color="secondary" @click="goHome">{{
              t('stats.home')
            }}
          </ion-button>
        </div>

      </div>
    </ion-content>


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
  onIonViewDidEnter,
  useIonRouter
} from "@ionic/vue";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
import StatsCard from "@/components/exercises/StatsCard.vue";
import {
  alertCircleOutline,
  arrowBack,
  closeCircleOutline,
  helpCircleOutline,
  textOutline,
  timeOutline
} from "ionicons/icons";
import MistakeCard from "@/components/exercises/MistakeCard.vue";
import dayjs from 'dayjs';
import {PracticeModes} from "@/config/exercises/practiceModes";
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {playTTS} from "@/helpers/tts.helper";
import {useWordInfoStore} from "@/states/wordInfo.state";
import ProgressBar from "progressbar.js";
import SemiCircle from "progressbar.js/semicircle";
import {Haptics, ImpactStyle} from "@capacitor/haptics";
import '@lottiefiles/dotlottie-wc';


import {isNative} from "@/helpers/app.helper";

import bear from '@/assets/lotties/bear.lottie'
import volcano from '@/assets/lotties/volcano.lottie'
import unicorn from '@/assets/lotties/unicorn.lottie'

const {
  wordPack,
  amountOfWords,
  wrongWords,
  wordsSkipped,
  hintsUsed,
  practiceTime,
  practiceMethodName,
  practiceOrder
} = storeToRefs(useVocabularyPracticeStore())

const {t} = useI18n()
const container = ref<HTMLDivElement | null>(null);
const showLottie = ref(false)


const mistakesMade = computed(() => wrongWords.value.reduce((acc, word) => acc + (word.mistakes ? word.mistakes.length : 0), 0))
const correctFirstTimeRatio = computed(() => (amountOfWords.value - wrongWords.value.length) / amountOfWords.value)

const {open} = useWordInfoStore()

const showMistakes = ref(false)
let bar: SemiCircle | null = null;
const scoreText = ref('');
const scoreColor = ref('');

const lottieToShow = computed(() => {
  if (correctFirstTimeRatio.value <= 0.4) return {img: volcano, size: 80};
  else if (correctFirstTimeRatio.value <= 0.8) return {img: bear, size: 160};
  else return {img: unicorn, size: 80};
})


onIonViewDidEnter(() => {
  setTimeout(() => showMistakes.value = true, 1000)
  setTimeout(() => {
    bar?.animate(correctFirstTimeRatio.value, {}, async () => {
      showLottie.value = true

      if (isNative()) {
        const ratio = correctFirstTimeRatio.value;
        const minDuration = 300;
        const maxDuration = 1200;
        const duration = Math.round(minDuration + (maxDuration - minDuration) * ratio);

        await Haptics.vibrate({duration});

        if (ratio >= 0.95) {
          await Haptics.impact({style: ImpactStyle.Heavy});
        }
      }
    });
  }, mistakesMade.value === 0 ? 1000 : 2000);

})

function createProgressBar() {
  if (!container.value) return;

  bar = new ProgressBar.SemiCircle(container.value, {
    strokeWidth: 4, // smaller than before
    color: '#FF0000', // start with red
    trailColor: '#eee',
    trailWidth: 1,
    easing: 'easeInOut',
    duration: 3000,
    svgStyle: {
      width: '100%',  // keeps it responsive
      height: '150px'  // adjust overall height here
    },
    step: (state, bar) => {
      const value = bar.value(); // 0 to 1

      if (isNative()) {
        let style;
        if (value < 0.33) {
          style = ImpactStyle.Light;
        } else if (value < 0.66) {
          style = ImpactStyle.Medium;
        } else {
          style = ImpactStyle.Heavy;
        }
        Haptics.impact({style});
      }

      let color;
      if (value < 0.7) {
        // red -> orange
        color = `rgb(${255}, ${Math.round(255 * (value / 0.5))}, 0)`;
      } else {
        // orange -> green
        color = `rgb(${Math.round(255 * (1 - (value - 0.5) / 0.5))}, 255, 0)`;
      }

      if (!bar.path) return

      bar.path.setAttribute('stroke', color);

      const displayValue = Math.round(value * 100);
      scoreText.value = displayValue === 0 ? '' : displayValue.toString() + '%';
      scoreColor.value = color;
    }
  });

  if (!bar.text) return;
  bar.text.style.fontSize = '2rem'; // smaller text
  bar.text.style.bottom = '16px'; // adjust height
}


onMounted(() => {
  createProgressBar()
})


const router = useIonRouter()
const stats = [
  {
    title: amountOfWords.value.toLocaleString(),
    description: t("stats.words_practiced"),
    icon: textOutline,
    color: '#2196F3', // blue for general info
    show: true
  },
  {
    title: formatPracticeTime(practiceTime.value),
    description: t("stats.time_spent2"),
    icon: timeOutline,
    color: '#009688', // teal for time/activity
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
  if (!wordPack.value) return;
  const practiceMethod = PracticeModes.find(el => el.id == practiceMethodName.value)
  if (!practiceMethod) return
  router.replace({name: practiceMethod.link, query: {retry: 'true'}, params: {wordPackId: wordPack.value.id}})
}

function goHome() {
  router.replace({name: 'home'})
}
</script>

<style scoped>

</style>