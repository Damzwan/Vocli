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
      <div class="w-full h-4/5 flex justify-center items-center" v-if="active && wordPack">
        <swiper
            effect="cards"
            :grabCursor="true"
            :modules="[EffectCards]"
            :loop="true"
            class="w-[240px] h-[320px]"
            ref="swiperRef"

        >
          <swiper-slide class="rounded-2xl" v-for="(word, i) in wordPack.words" :key="word.from" @click="onCardClick"
                        :style="{backgroundColor: colors[i % colors.length]}">
            <div class="w-full h-full p-8 flex justify-center items-center">
              <p class="text-center text-black text-2xl font-bold">{{ flipped ? word.from : word['to'] }}</p>
            </div>
          </swiper-slide>

        </swiper>
      </div>

    </ion-content>


  </ion-page>
</template>


<script setup lang="ts">

import {IonButton, IonContent, IonIcon, IonPage, useIonRouter, IonHeader, IonToolbar} from "@ionic/vue";
import {arrowBack} from "ionicons/icons";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
// import Swiper styles
import {Swiper, SwiperSlide} from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/effect-cards';
import {EffectCards} from 'swiper/modules';
import {onBeforeUnmount, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";

const swiperRef = ref<any>(null);

const active = ref(false);
const {t} = useI18n()

// helps with the initial rendering, TODO hack
setTimeout(() => {
  active.value = true;
}, 100)


const router = useIonRouter()

const flipped = ref(false);

onMounted(() => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (!swiperRef.value) return;

    const swiper = swiperRef.value.$el.swiper; // access swiper instance

    if (event.key === 'ArrowLeft') {
      swiper.slidePrev();
    } else if (event.key === 'ArrowRight') {
      swiper.slideNext();
    } else if (event.key === 'ArrowUp') {
      onCardClick()
    }
  };

  document.addEventListener('keydown', onKeyDown);

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeyDown);
  });
});


const {wordPack} = storeToRefs(useVocabularyPracticeStore())

function onCardClick() {
  flipped.value = !flipped.value;
}

const colors = ['#FDE68A', '#A7F3D0', '#BFDBFE', '#FBCFE8', '#DDD6FE', '#FCA5A5', '#C4B5FD']
</script>

<style scoped>


</style>