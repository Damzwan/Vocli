<template>
  <ion-page class="max-w-[1000px] mx-auto">
    <ion-header>
      <ion-toolbar color="background">
        <div class="flex items-center px-2 h-16">
          <ion-button fill="clear" @click="router.back()">
            <ion-icon slot="icon-only" :icon="arrowBack"/>
          </ion-button>
          <p class="text-2xl font-bold pl-2">{{ t('translation.title') }}</p>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content v-if="words.length > 0 && wordPack">


      <div class="w-full h-4/5 flex justify-center items-center p-12 flex-col">
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
                {{ t('translation.hint') }} ({{ currentHints }} / {{ maxHints }})
              </ion-button>
              <ion-button id="skip-alert">{{ t('translation.skip') }}</ion-button>
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

      <ion-alert
          @will-dismiss="skipWord"
          trigger="skip-alert"
          header="Word Skipped"
          :message="`${practiceOrder == PracticeOrder.knownToLearn ? words[0].to : words[0].from} - ${practiceOrder == PracticeOrder.knownToLearn ? words[0].from : words[0].to}`"
          :buttons="[{text: 'info', handler: () => {
            if (!wordPack) return;
            open({learnLanguage: wordPack.learnLanguage, knownLanguage: wordPack.knownLanguage, knownWord: words[0].from, learnWord: words[0].to})
            return false
          }}, 'Ok']"
      />

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
  onIonViewWillEnter,
  useIonRouter,
  IonHeader,
  IonToolbar,
  IonAlert
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
import {useWordInfoStore} from "@/states/wordInfo.state";

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
} = storeToRefs(useVocabularyPracticeStore());

const {open} = useWordInfoStore()

const words = ref<WordItem[]>([]);
const router = useIonRouter();
const route = useRoute();
const {t} = useI18n();

const toWordInput = ref("");
const currentWord = ref<WordItem | null>(null);
const startingAmountOfWords = ref(0);

const maxHints = 3;
const currentHints = ref(0);

const wrongInput = ref("");
const wrongAnimation = ref(false);
const finished = ref(false);
let startTime = 0;

function initWords(isRetry = false) {
  if (!wordPack.value) return;

  words.value = shuffle(isRetry && copyOfWords.value.length ? copyOfWords.value : wordPack.value.words)
      .slice(0, amountOfWords.value);

  copyOfWords.value = [...words.value];
  startingAmountOfWords.value = words.value.length;
  wrongWords.value = [];
  hintsUsed.value = 0;
  wordsSkipped.value = 0;
  finished.value = false;
  currentHints.value = 0;
  wrongInput.value = "";
  toWordInput.value = "";

  currentWord.value = words.value[0];
  startTime = Date.now();
  practiceMethodName.value = 'translation';
}

function showNextWord(pushToEnd = false) {
  if (!currentWord.value) return;

  // Move current word to end if needed
  if (pushToEnd) words.value.push(currentWord.value);

  // Remove first word (or same if pushed)
  words.value.shift();

  if (words.value.length === 0) {
    finished.value = true;
    practiceTime.value = Date.now() - startTime;
    if (Capacitor.isNativePlatform()) Haptics.vibrate({duration: 1000});
    return;
  }

  currentWord.value = words.value[0];
  toWordInput.value = "";
  currentHints.value = 0;
  wrongInput.value = "";
}

function checkAnswer() {
  if (!currentWord.value) return;

  const input = sanitize(toWordInput.value);
  const correct = sanitize(practiceOrder.value === PracticeOrder.knownToLearn ? currentWord.value.to : currentWord.value.from);

  if (input === correct) {
    if (Capacitor.isNativePlatform()) Haptics.notification({type: NotificationType.Success});
    if (currentHints.value === maxHints) showNextWord(true);
    else showNextWord();
  } else {
    const similarity = Math.round(similarityScore(input, correct) * 100);
    wrongInput.value = `${t('translation.wrong_try_again')} (${t('translation.similarity_score')}: ${similarity}%)`;

    // Track wrong word
    const lastWrong = wrongWords.value[wrongWords.value.length - 1];
    if (!lastWrong || lastWrong.to !== currentWord.value.to) {
      wrongWords.value.push({from: currentWord.value.from, to: currentWord.value.to, mistakes: [input]});
    } else {
      lastWrong.mistakes?.push(input);
    }

    wrongAnimation.value = true;
    if (Capacitor.isNativePlatform()) Haptics.notification({type: NotificationType.Success});
    setTimeout(() => wrongAnimation.value = false, 1000);
  }
}

function skipWord() {
  if (!currentWord.value) return;

  wrongWords.value.push({from: currentWord.value.from, to: currentWord.value.to, skipped: true});
  wordsSkipped.value++;
  if (Capacitor.isNativePlatform()) Haptics.notification({type: NotificationType.Success});
  showNextWord(true); // push skipped word to end
}

function hint() {
  if (!currentWord.value) return;

  if (currentHints.value >= maxHints) {
    useAppStore().showToast(t('toast.all_hints_used'), {color: 'warning'});
    return;
  }

  currentHints.value++;
  hintsUsed.value++;

  const word = practiceOrder.value === PracticeOrder.knownToLearn ? currentWord.value.to : currentWord.value.from;
  const revealCount = Math.ceil((currentHints.value / maxHints) * word.length);
  toWordInput.value = word.slice(0, revealCount) + '*'.repeat(word.length - revealCount);

  // Track hint usage
  const lastWrong = wrongWords.value[wrongWords.value.length - 1];
  if (!lastWrong || lastWrong.to !== currentWord.value.to) {
    wrongWords.value.push({from: currentWord.value.from, to: currentWord.value.to, hint: 1});
  } else {
    lastWrong.hint = (lastWrong.hint || 0) + 1;
  }

}

onIonViewWillEnter(() => {
  const retry = route.query.retry;
  initWords(!!retry && copyOfWords.value.length > 0);
});
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