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
            @slideChange="onSlideChange()"

        >
          <swiper-slide
              v-for="(word, i) in wordPack.words"
              :key="word.from"
              class="relative cursor-pointer rounded-2xl"
              :style="{ backgroundColor: colors[i % colors.length] }"
          >
            <!-- Wrapper for flip animation -->
            <div class="flip-wrapper w-full h-full flex justify-center items-center rounded-2xl"
                 @click="onCardClick(i)">
              <!-- Inner flip card -->
              <div
                  class="flip-card w-full h-full rounded-2xl transition-transform duration-500 ease-in-out transform"
                  :class="{ 'rotate-y-180 scale-105': flippedIndex === i }"
              >
                <!-- Front -->
                <div
                    class="flip-card-front absolute w-full h-full flex justify-center items-center rounded-2xl backface-hidden">
                  <p class="text-black text-3xl font-bold text-center">{{ frontIsLearnLanguage ? word.to : word.from }}</p>
                </div>

                <!-- Back -->
                <div
                    class="flip-card-back absolute w-full h-full flex justify-center items-center rounded-2xl backface-hidden rotate-y-180">
                  <p class="text-black text-3xl font-bold text-center">{{ frontIsLearnLanguage ? word.from : word.to }}</p>
                </div>
              </div>

              <ion-button
                  fill="clear"
                  size="large"
                  class="absolute bottom-2 right-2 text-black"
                  @click="(e: Event) => onWordInfoClick(e, word)"
              >
                <ion-icon slot="icon-only" class="w-10 h-10" :icon="informationCircleOutline"></ion-icon>
              </ion-button>
            </div>
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

import {IonButton, IonContent, IonIcon, IonPage, useIonRouter, IonHeader, IonToolbar, IonToggle} from "@ionic/vue";
import {arrowBack, informationCircleOutline} from "ionicons/icons";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
// import Swiper styles
import {Swiper, SwiperSlide} from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/effect-cards';
import {EffectCards} from 'swiper/modules';
import {onBeforeUnmount, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useWordInfoStore} from "@/states/wordInfo.state";
import {WordItem} from "@/types";
import {LANGUAGE_FLAGS} from "@/config/languages.config";

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

onMounted(() => {
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

  document.addEventListener('keydown', onKeyDown);

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeyDown);
  });
});


const {wordPack} = storeToRefs(useVocabularyPracticeStore())

function onCardClick(index: number) {
  flippedIndex.value = flippedIndex.value === index ? null : index;
}

function onSlideChange() {
  currentSlide.value = swiperRef.value.$el.swiper.realIndex
  flippedIndex.value = null; // reset flip on card change
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

const colors = ['#FDE68A', '#A7F3D0', '#BFDBFE', '#FBCFE8', '#DDD6FE', '#FCA5A5', '#C4B5FD']
</script>

<style scoped>

.perspective {
  perspective: 1000px;
}

.flip-card {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}


</style>