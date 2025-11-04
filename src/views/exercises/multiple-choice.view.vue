<template>
  <ion-page class="max-w-[1000px] mx-auto">
    <ion-header>
      <ion-toolbar color="background">
        <div class="flex items-center px-2 h-16">
          <ion-button fill="clear" @click="router.back()">
            <ion-icon slot="icon-only" :icon="arrowBack"/>
          </ion-button>
          <p class="text-2xl font-bold pl-2">{{ t('multiple-choice.title') }}</p>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content v-if="multipleChoiceItems.length > 0">
      <div class="w-full h-full flex justify-center items-center p-12 flex-col">
        <div :class="{ 'opacity-50 pointer-events-none': finished }" class="transition-opacity duration-500 w-full">
          <p class="text-4xl text-white text-center">
            {{ multipleChoiceItems[0].toShow }}
            ({{ (startingAmountOfWords - multipleChoiceItems.length) + 1 }}/{{ startingAmountOfWords }})</p>
          <div class="flex flex-col pt-12">
            <div
                @click="() => checkAnswer(option)"
                v-for="(option, i) in multipleChoiceItems[0].options"
                :key="option"
                class="rounded-2xl p-4 mb-4 text-white font-medium cursor-pointer shadow-md transition-all duration-200 hover:scale-[1.02]"
                :style="{backgroundColor: OPTION_COLORS[i],}"
            >
              {{ option }}
            </div>

          </div>
          <div class="h-16">
            <p class="text-red-400 pt-4 text-center text-2xl"
               :class="[ wrongAnimation ? 'animate-shake' : '']" v-if="wrongInput != ''">{{
                wrongInput
              }}</p>
          </div>
        </div>

        <transition name="fade">
          <div v-if="finished"
               class="mt-8 text-center absolute bottom-12 flex flex-col bg-card-background p-4 rounded-2xl">
            <p class="text-2xl text-white font-bold mb-4">{{ t('multiple-choice.complete') }}! 🎉</p>
            <ion-button class="mb-3" @click="router.replace(`/practice/${wordPack?.id}/results`)">
              {{ t('multiple-choice.results') }}
            </ion-button>
            <ion-button class="mb-3" color="secondary" @click="() => initWords(true)">{{ t('multiple-choice.again') }}
            </ion-button>
            <ion-button class="mb-3" fill="outline" color="secondary" @click="router.back()">
              {{ t('multiple-choice.different_exercise') }}
            </ion-button>
            <ion-button fill="clear" color="secondary" @click="router.replace({name: 'home'})">
              {{ t('multiple-choice.home') }}
            </ion-button>
          </div>
        </transition>


      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {shuffle} from "@/helpers/exercises";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  onIonViewWillEnter,
  useIonRouter,
  IonHeader,
  IonToolbar,
} from "@ionic/vue";
import {arrowBack} from "ionicons/icons";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
import {PracticeOrder} from "@/types";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {Capacitor} from "@capacitor/core";
import {Haptics, NotificationType} from "@capacitor/haptics";
import {useI18n} from "vue-i18n";

type MultipleChoiceItem = {
  toShow: string;
  correct: string;
  options: string[];
}
const AMOUNT_OF_OPTIONS_PER_ITEM = 4
const OPTION_COLORS = ['#4FC3F7', '#81C784', '#FFB74D', '#E57373'];

const router = useIonRouter()
const route = useRoute();
const {t} = useI18n()


const {
  wrongWords,
  practiceOrder,
  wordPack,
  amountOfWords,
  practiceTime,
  copyOfWords,
  practiceMethodName
} = storeToRefs(useVocabularyPracticeStore())

const multipleChoiceItems = ref<MultipleChoiceItem[]>([])
const wrongInput = ref("");

const finished = ref(false);
let startTime = new Date().getTime();
const startingAmountOfWords = ref(0)

const wrongAnimation = ref(false);

function initWords(isRetry: boolean) {
  if (!wordPack.value) return;

  // Step 1: Get the word list
  const words = isRetry
      ? shuffle(copyOfWords.value)
      : shuffle(wordPack.value.words).splice(0, amountOfWords.value);
  copyOfWords.value = words;
  startingAmountOfWords.value = words.length

  // Step 2: Create multiple choice items
  multipleChoiceItems.value = words.map((word): MultipleChoiceItem => {
    const options = new Set<string>();
    options.add(practiceOrder.value == PracticeOrder.knownToLearn ? word.to : word.from); // Add the correct answer

    while (options.size < AMOUNT_OF_OPTIONS_PER_ITEM) {
      // Pick a random word from the full word list
      const randomIndex = Math.floor(Math.random() * wordPack.value!.words.length);
      const randomWord = wordPack.value!.words[randomIndex];

      // Add only if it's not the current word
      if (randomWord !== word) {
        options.add(practiceOrder.value == PracticeOrder.knownToLearn ? randomWord.to : randomWord.from);
      }
    }

    // Shuffle the options so correct answer isn't always first
    return {
      toShow: practiceOrder.value == PracticeOrder.knownToLearn ? word.from : word.to,
      correct: practiceOrder.value == PracticeOrder.knownToLearn ? word.to : word.from,
      options: shuffle(Array.from(options))
    };
  });

  startTime = new Date().getTime();
  wrongWords.value = []
  finished.value = false
  practiceMethodName.value = 'multiple-choice'
}

function nextItem() {
  if (multipleChoiceItems.value.length == 1) {
    finished.value = true
    if (Capacitor.isNativePlatform()) {
      Haptics.vibrate({duration: 1000});
    }
    practiceTime.value = new Date().getTime() - startTime;
  } else {
    multipleChoiceItems.value = multipleChoiceItems.value.toSpliced(0, 1)
  }
}

function checkAnswer(option: string) {
  wrongInput.value = ""
  const item = multipleChoiceItems.value[0]
  if (option === item.correct) {
    if (Capacitor.isNativePlatform()) {
      Haptics.notification({type: NotificationType.Success});
    }
    nextItem()
  } else {
    wrongInput.value = t('multiple-choice.wrong_choice');
    const wrongWord = wrongWords.value.length > 0 ? wrongWords.value[wrongWords.value.length - 1] : undefined;
    if (!wrongWord || wrongWord.to !== item.correct) {
      wrongWords.value.push({from: item.toShow, to: item.correct, mistakes: [option]});
    } else {
      if (!wrongWords.value[0].mistakes) return
      wrongWords.value[0].mistakes.push(option);
    }

    wrongAnimation.value = true;
    if (Capacitor.isNativePlatform()) {
      Haptics.notification({type: NotificationType.Error});
    }
    setTimeout(() => {
      wrongAnimation.value = false;
    }, 1000)
  }
}

onMounted(() => {
  const retry = route.query.retry;
  initWords(!!retry && copyOfWords.value.length > 0);
})
// onIonViewWillEnter(() => {
//   const retry = route.query.retry;
//   initWords(!!retry && copyOfWords.value.length > 0);
// })

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>