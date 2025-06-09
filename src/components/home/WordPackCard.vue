<template>
  <div
      class="w-full bg-card-background hover:bg-card-background-hover active:bg-card-background-active border-card-border hover:border-b-card-border-hover
       transition-colors rounded-2xl p-4 cursor-pointer flex items-center justify-between group"
  >
    <!-- Left content -->
    <div class="flex flex-col space-y-2 text-zinc-200">
      <!-- Meta info -->
      <div class="text-md text-zinc-400">
        {{ wordPack.words.length }} {{ t('home.word_pack_card.words')}} • {{ dayjs(wordPack.lastEdited).format('MMM D, YYYY') }}
      </div>

      <!-- Title + Flags Row -->
      <div class="flex items-center justify-between space-x-4">
        <div class="text-2xl font-semibold text-white">
          {{ wordPack.name }}
        </div>

        <div class="flex space-x-3">
          <img :src="LANGUAGE_FLAGS[wordPack.knownLanguage]" alt="Italian flag"
               class="w-6 h-6 rounded-full object-cover"/>
          <img :src="LANGUAGE_FLAGS[wordPack.learnLanguage]" alt="English flag"
               class="w-6 h-6 rounded-full object-cover"/>
        </div>
      </div>
    </div>

    <!-- Right icon -->
    <ion-icon
        :icon="chevronForwardOutline"
        class="text-zinc-400 group-hover:text-white text-xl transition"
    ></ion-icon>
  </div>
</template>


<script setup lang="ts">
import {WordPack} from "@/types";

import {IonIcon} from "@ionic/vue";
import {chevronForwardOutline} from "ionicons/icons";
import dayjs from 'dayjs'
import {LANGUAGE_FLAGS} from "@/config/languages.config";
import {useI18n} from "vue-i18n"; // ES 2015

const {t} = useI18n()



defineProps<{
  wordPack: WordPack
}>()

</script>

<style scoped>

</style>