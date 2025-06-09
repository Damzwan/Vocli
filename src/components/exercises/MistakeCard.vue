<template>
  <div
      class="w-full bg-card-background hover:bg-card-background-hover active:bg-card-background-active border-card-border hover:border-b-card-border-hover rounded-xl px-4 py-3 shadow-md space-y-3">
    <!-- Word translation row -->
    <div class="flex">
      <ion-chip :outline="true" class="bg-warning px-2" v-if="wordItem.skipped">
        Skipped
      </ion-chip>
      <ion-chip :outline="true" class="bg-red-400 px-2 ml-2" v-if="wordItem.hint && wordItem.hint > 0">
        {{ wordItem.hint }} hints used
      </ion-chip>
    </div>

    <div class="grid grid-cols-3 items-center text-primary text-lg font-medium">
      <p class="text-left">{{ wordItem.from }}</p>
      <div class="flex justify-center">
        <ion-icon :icon="arrowForwardOutline" class="text-gray-400 text-xl"/>
      </div>
      <p class="text-right">{{ wordItem.to }}</p>
    </div>

    <!-- Mistakes -->
    <div v-if="wordItem.mistakes && wordItem.mistakes.length > 0">
      <div class="text-base text-red-500 font-semibold mb-1">Mistakes:</div>
      <ul class=" list-inside text-base text-red-400">
        <li v-for="(mistake, index) in wordItem.mistakes" :key="index">
          {{ mistake }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {IonIcon, IonChip} from "@ionic/vue";
import {arrowForwardOutline} from "ionicons/icons";
import {WrongWordItem} from "@/types";

defineProps<{
  wordItem: WrongWordItem;
}>();
</script>

<style scoped>
ion-icon {
  vertical-align: middle;
}
</style>
