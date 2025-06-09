<template>
  <ion-page class="max-w-[1000px] mx-auto">
    <ion-content v-if="words.length > 0 && wordPack">
      <div class="flex items-center px-2 h-16">
        <ion-button fill="clear" @click="router.back(iosTransitionAnimation)">
          <ion-icon slot="icon-only" :icon="arrowBack"/>
        </ion-button>
        <p class="text-2xl font-bold pl-2">{{ t('translation.title') }}</p>
      </div>

      <div class="w-full h-3/5 flex justify-center items-center p-12 flex-col">
        <div :class="{ 'opacity-50 pointer-events-none': finished }" class="transition-opacity duration-500 w-full">
          <p class="text-4xl text-white text-center">
            {{ practiceOrder == PracticeOrder.knownToLearn ? words[0].from : words[0].to }}
            ({{ (startingAmountOfWords - words.length) + 1 }}/{{ startingAmountOfWords }})</p>
          <ion-input v-model="toWordInput" class="mt-12 bg-zinc-800 rounded-2xl" @keyup.enter="checkAnswer"
                     :class="{ 'animate-shake border border-red-400': wrongAnimation }"
                     :placeholder="`${t(`languages.${practiceOrder == PracticeOrder.knownToLearn
                     ? wordPack.learnLanguage : wordPack.knownLanguage}`)} ${t('translation.translation')}...`">

            <ion-icon color="primary" slot="start" class="pl-4" v-if="wordPack"
                      :icon="practiceOrder == PracticeOrder.knownToLearn ? LANGUAGE_FLAGS[wordPack.learnLanguage] : LANGUAGE_FLAGS[wordPack.knownLanguage]"/>
            <ion-button slot="end" fill="clear" @click="checkAnswer">
              <ion-icon color="primary" :icon="chevronForwardOutline"/>
            </ion-button>
          </ion-input>
          <div class="w-full flex flex-col space-y-4 pt-8">

            <!-- First row: hint + skip -->
            <div class="flex justify-end flex-wrap space-x-4">
              <ion-button @click="hint">
                {{ t('translation.hint') }} ({{ hintPartRevealed }} / {{ maxAmountOfHints }})
              </ion-button>
              <ion-button @click="skipAnswer">{{ t('translation.skip') }}</ion-button>
            </div>

            <!-- Second row: check -->
            <div class="flex justify-end">
              <ion-button @click="checkAnswer">{{ t('translation.check') }}</ion-button>
            </div>

          </div>

          <div class="pt-4 h-4">
            <p class="text-red-300" v-if="wrongInput != ''">{{ wrongInput }}</p>
          </div>
        </div>

        <transition name="fade">
          <div v-if="finished"
               class="mt-8 text-center absolute bottom-12 flex flex-col bg-card-background p-4 rounded-2xl">
            <p class="text-2xl text-white font-bold mb-4">🎉 {{ t('translation.complete') }}! 🎉</p>
            <ion-button class="mb-3" @click="router.replace('/practice/results')">{{ t('translation.results') }}
            </ion-button>
            <ion-button class="mb-3" color="secondary" @click="() => initWords(true)">{{ t('translation.again') }}
            </ion-button>
            <ion-button class="mb-3" fill="outline" color="secondary" @click="router.replace('/practice')">
              {{ t('translation.different_exercise') }}
            </ion-button>
            <ion-button fill="clear" color="secondary" @click="router.replace('/home')">{{ t('translation.home') }}
            </ion-button>
          </div>
        </transition>
      </div>


    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
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
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
import {ref} from "vue";
import {useRoute} from 'vue-router';
import {PracticeOrder, WordItem} from "@/types";
import {storeToRefs} from "pinia";
import {arrowBack, chevronForwardOutline} from "ionicons/icons";
import {useAppStore} from "@/states/app.state";
import {sanitize, shuffle, similarityScore} from "@/helpers/exercises";
import {LANGUAGE_FLAGS} from "@/config/languages.config";
import {Capacitor} from "@capacitor/core";
import {Haptics, NotificationType} from "@capacitor/haptics";
import {useI18n} from "vue-i18n";

const {
  wrongWords,
  practiceOrder,
  wordPack,
  hintsUsed,
  amountOfWords,
  wordsSkipped,
  practiceTime,
  copyOfWords,
  practiceMethodName
} = storeToRefs(useVocabularyPracticeStore())
const words = ref<WordItem[]>([])
const router = useIonRouter()
const route = useRoute();
const {t} = useI18n()

const toWord = ref("")
const toWordInput = ref("")
const startingAmountOfWords = ref(0)

const maxAmountOfHints = 3;
const hintPartRevealed = ref(0);

const wrongInput = ref("");
const wrongAnimation = ref(false);

const finished = ref(false);
let startTime = new Date().getTime();

const initWords = (isRetry = false) => {
  if (!wordPack.value) return
  words.value = isRetry ? shuffle(copyOfWords.value) : shuffle(wordPack.value.words).splice(0, amountOfWords.value)
  copyOfWords.value = words.value
  toWord.value = practiceOrder.value == PracticeOrder.knownToLearn ? words.value[0].to : words.value[0].from
  wrongWords.value = []
  hintsUsed.value = 0
  wordsSkipped.value = 0
  startingAmountOfWords.value = words.value.length
  finished.value = false
  wrongInput.value = ""
  toWordInput.value = ""
  startTime = new Date().getTime();
  practiceMethodName.value = 'translation'
}

function skipAnswer() {
  const wrongWord = wrongWords.value.length > 0 ? wrongWords.value[wrongWords.value.length - 1] : undefined;

  if (!wrongWord || wrongWord.to != toWord.value) {
    wrongWords.value.push({from: words.value[0].from, to: words.value[0].to, skipped: true});
  } else wrongWords.value[wrongWords.value.length - 1].skipped = true

  if (Capacitor.isNativePlatform()) {
    Haptics.notification({type: NotificationType.Success});
  }

  wordsSkipped.value++
  nextWord()
}

function checkAnswer() {
  const input = sanitize(toWordInput.value);
  const correct = sanitize(toWord.value);

  const isCorrect = input === correct;

  if (isCorrect) {
    // play sound?
    nextWord()
    if (Capacitor.isNativePlatform()) {
      Haptics.notification({type: NotificationType.Success});
    }
  } else {
    const similarity = similarityScore(input, correct); // 0.0 to 1.0
    wrongInput.value = `${t('translation.wrong_try_again')} (${t('translation.similarity_score')}: ${Math.round(similarity * 100)}%)`
    const wrongWord = wrongWords.value.length > 0 ? wrongWords.value[wrongWords.value.length - 1] : undefined;
    if (!wrongWord || wrongWord.to != toWord.value) {
      wrongWords.value.push({from: words.value[0].from, to: words.value[0].to, mistakes: [input]});
    } else {
      if (wrongWords.value[wrongWords.value.length - 1].mistakes) wrongWords.value[wrongWords.value.length - 1].mistakes.push(input);
      else wrongWords.value[wrongWords.value.length - 1].mistakes = [input]
    }

    wrongAnimation.value = true
    if (Capacitor.isNativePlatform()) {
      Haptics.notification({type: NotificationType.Success});
    }
    setTimeout(() => {
      wrongAnimation.value = false
    }, 1000)
  }

}

function nextWord() {
  wrongInput.value = ""
  if (words.value.length == 1) {
    finished.value = true
    if (Capacitor.isNativePlatform()) {
      Haptics.vibrate({duration: 1000});
    }
    practiceTime.value = new Date().getTime() - startTime;
  } else {
    words.value = words.value.toSpliced(0, 1)
    toWord.value = practiceOrder.value == PracticeOrder.knownToLearn ? words.value[0].to : words.value[0].from
    toWordInput.value = ""
    hintPartRevealed.value = 0;
  }
}


function hint() {
  if (hintPartRevealed.value == maxAmountOfHints) {
    const {showToast} = useAppStore()
    showToast(t('toast.all_hints_used'), {color: 'warning'})
    return
  }
  hintPartRevealed.value = Math.min(hintPartRevealed.value + 1, maxAmountOfHints);
  hintsUsed.value++;

  const word = toWord.value;
  const totalLength = word.length;
  const fraction = hintPartRevealed.value / maxAmountOfHints;
  const revealLength = Math.ceil(fraction * totalLength);

  const revealed = word.slice(0, revealLength);
  const masked = '*'.repeat(totalLength - revealLength);

  toWordInput.value = revealed + masked;

  const wrongWord = wrongWords.value.length > 0 ? wrongWords.value[wrongWords.value.length - 1] : undefined;
  if (!wrongWord || wrongWord.to != toWord.value) {
    wrongWords.value.push({from: words.value[0].from, to: words.value[0].to, hint: 1});
  } else wrongWords.value[wrongWords.value.length - 1].hint = wrongWord.hint ? wrongWord.hint + 1 : 1

}


onIonViewWillEnter(() => {
  const retry = route.query.retry;
  initWords(!!retry && copyOfWords.value.length > 0);
})

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