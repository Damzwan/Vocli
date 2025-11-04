<template>
  <ion-page class="max-w-[1000px] mx-auto">
    <ion-header>
      <ion-toolbar color="background">
        <div class="flex items-center px-2 h-16">
          <ion-button fill="clear" @click="router.back()">
            <ion-icon slot="icon-only" :icon="arrowBack"/>
          </ion-button>
          <p class="text-2xl font-bold pl-2">{{ t('flashcards.title') }}</p>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="w-full h-full flex justify-center items-center flex-col" v-if="active && wordPack">
        <div class="flex justify-center items-center space-x-4 mb-12 absolute top-8 ">
          <ion-icon slot="start" :icon="LANGUAGE_FLAGS[wordPack.knownLanguage]" class="w-10 h-10"/>
          <ion-toggle v-model="frontIsLearnLanguage"/>
          <ion-icon slot="start" :icon="LANGUAGE_FLAGS[wordPack.learnLanguage]" class="w-10 h-10"/>
        </div>
        <swiper
            effect="cards"
            :grabCursor="true"
            :modules="[EffectCards]"
            :loop="true"
            class="w-[240px] h-[320px]"
            ref="swiperRef"
            @realIndexChange="onSlideChange()"
            @slideChangeTransitionEnd="onTransitionEnd"
            @slideResetTransitionEnd="onTransitionEnd"

        >
          <swiper-slide
              v-for="(word, i) in wordPack.words"
              :key="word.from"
              class="relative cursor-pointer rounded-2xl"
              @click="onCardClick(swiperRef.$el.swiper.realIndex)"
              :style="{ backgroundColor: colors[i % colors.length] }"
          >


            <div
                class="w-full h-full flex justify-center items-center p-4"
            >
              <!-- Front -->
              <p
                  v-if="flippedIndex !== i"
                  class="text-black text-3xl font-bold text-center animate-fade animate-duration-500"
              >
                {{ frontIsLearnLanguage ? word.to : word.from }}
              </p>

              <!-- Back -->
              <p
                  v-else
                  class="text-black text-3xl font-bold text-center animate-fade animate-duration-500"
              >
                {{ frontIsLearnLanguage ? word.from : word.to }}
              </p>
            </div>


            <ion-button
                size="large"
                fill="clear"
                class="absolute bottom-2 right-12 text-black"
                @click="(e: Event) => onTTSClick(e, word)"
            >
              <ion-icon slot="icon-only" :icon="volumeHighOutline"></ion-icon>
            </ion-button>

            <ion-button
                fill="clear"
                size="large"
                class="absolute bottom-2 right-2 text-black"
                @click="(e: Event) => onWordInfoClick(e, word)"
            >
              <ion-icon slot="icon-only" class="w-10 h-10" :icon="informationCircleOutline"></ion-icon>
            </ion-button>
          </swiper-slide>


        </swiper>

        <p class="mt-12 text-gray-200 text-4xl">
          {{ currentSlide + 1 }} / {{ wordPack?.words.length || 0 }}
        </p>
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
  IonToggle,
  IonToolbar,
  onIonViewDidLeave,
  onIonViewWillEnter,
  useIonRouter
} from "@ionic/vue";
import {arrowBack, informationCircleOutline, volumeHighOutline} from "ionicons/icons";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
// import Swiper styles
import {Swiper, SwiperSlide} from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/effect-cards';
import {EffectCards} from 'swiper/modules';
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import {useWordInfoStore} from "@/states/wordInfo.state";
import {WordItem} from "@/types";
import {LANGUAGE_FLAGS} from "@/config/languages.config";
import {playTTS} from "@/helpers/tts.helper";

const swiperRef = ref<any>(null);

const active = ref(false);
const currentSlide = ref(0);
const frontIsLearnLanguage = ref(false);
const {t} = useI18n()

const {open} = useWordInfoStore()

// helps with the initial rendering, TODO hack
setTimeout(() => {
  active.value = true;
}, 100)


const router = useIonRouter()

const flippedIndex = ref<number | null>(null);

const onKeyDown = (event: KeyboardEvent) => {
  if (!swiperRef.value) return;

  const swiper = swiperRef.value.$el.swiper; // access swiper instance

  if (event.key === 'ArrowLeft') {
    swiper.slidePrev();
  } else if (event.key === 'ArrowRight') {
    swiper.slideNext();
  } else if (event.key === 'ArrowUp') {
    onCardClick(swiperRef.value.$el.swiper.realIndex)
  }
};
onIonViewWillEnter(() => {
  document.addEventListener('keydown', onKeyDown);
});

onIonViewDidLeave(() => {
  if (swiperRef.value) {
    document.removeEventListener('keydown', onKeyDown);
  }
})


const {wordPack} = storeToRefs(useVocabularyPracticeStore())

function onCardClick(index: number) {
  flippedIndex.value = flippedIndex.value === index ? null : index;
}

function onSlideChange() {
  if (!swiperRef.value) return;
  currentSlide.value = swiperRef.value.$el.swiper.realIndex
}

function onTransitionEnd() {
  if (!swiperRef.value) return;
  const index = swiperRef.value.$el.swiper.realIndex

  if (flippedIndex.value === index) return;
  flippedIndex.value = null
}

function onWordInfoClick(e: Event, word: WordItem) {
  e.stopPropagation();
  if (!wordPack.value) return;
  open({
    learnWord: word.to,
    knownWord: word.from,
    knownLanguage: wordPack.value.knownLanguage,
    learnLanguage: wordPack.value.learnLanguage
  })
}

function onTTSClick(e: Event, word: WordItem) {
  e.stopPropagation();
  if (!wordPack.value) return;
  playTTS(word.to, wordPack.value.learnLanguage)
}


const colors = ['#FDE68A', '#A7F3D0', '#BFDBFE', '#FBCFE8', '#DDD6FE', '#FCA5A5', '#C4B5FD']
</script>

<style scoped>



</style>