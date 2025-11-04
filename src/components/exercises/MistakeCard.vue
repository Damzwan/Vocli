<template>
  <div
      class="px-2 w-full bg-card-background hover:bg-card-background-hover active:bg-card-background-active border-card-border hover:border-b-card-border-hover rounded-xl py-1 grid grid-cols-[1fr_auto] items-center relative"
  >

    <div class="flex items-center justify-center space-x-2">
      <!-- From word -->
      <p class="text-left">{{ practiceOrder === PracticeOrder.knownToLearn ? wordItem.from : wordItem.to }}</p>

      <!-- Arrow -->
      <div class="flex justify-center">
        <ion-icon :icon="arrowForwardOutline" class="text-gray-400 text-xl"/>
      </div>

      <!-- To word with mistakes -->
      <p class="text-right flex items-center space-x-1">
        <span>{{ practiceOrder === PracticeOrder.knownToLearn ? wordItem.to : wordItem.from }}</span>

        <!-- Mistakes (max 2, tooltip for all) -->
        <span
            v-if="wordItem.mistakes?.length"
            class="text-red-500 text-xs font-semibold cursor-help"
            :title="wordItem.mistakes.join(', ')"
        >
      ({{ wordItem.mistakes.slice(0, 2).join(', ') }}<span v-if="wordItem.mistakes.length > 2">…</span>)
    </span>
      </p>
    </div>


    <!-- 🔹 Word buttons -->
    <div class="flex space-x-1 mr-2">
      <!-- TTS button -->
      <ion-button
          size="large"
          fill="clear"
          @click="emits('play-tts', wordItem.to)"
      >
        <ion-icon slot="icon-only" :icon="volumeHighOutline"></ion-icon>
      </ion-button>

      <!-- Word info button -->
      <ion-button
          size="large"
          fill="clear"
          @click="emits('open-word-info')"
      >
        <ion-icon slot="icon-only" :icon="informationCircleOutline"></ion-icon>
      </ion-button>
    </div>

    <div class="flex mt-1">
      <p class="text-orange-400 pl-2 -mt-1 text-sm" v-if="wordItem.hint">Hints: {{ wordItem.hint }}</p>
      <p class="text-orange-600 pl-2 -mt-1 text-sm" v-if="wordItem.skipped">Skipped : {{ wordItem.skipped }}</p>
    </div>


  </div>
</template>

<script setup lang="ts">
import {IonButton, IonIcon} from "@ionic/vue";
import {arrowForwardOutline, informationCircleOutline, volumeHighOutline} from "ionicons/icons";
import {PracticeOrder, WrongWordItem} from "@/types";

const emits = defineEmits(["open-word-info", "play-tts"]);

defineProps<{
  wordItem: WrongWordItem;
  practiceOrder: PracticeOrder
}>();
</script>

<style scoped>
ion-icon {
  vertical-align: middle;
}
</style>
