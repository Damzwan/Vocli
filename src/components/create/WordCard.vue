<template>
  <div
      class="w-full bg-card-background hover:bg-card-background-hover active:bg-card-background-active border-card-border hover:border-b-card-border-hover
       rounded-xl px-4 py-3 flex items-center justify-between space-x-4 cursor-pointer">
    <div class="text-white text-base font-medium truncate text-center w-full">
      {{ wordItem.from }}
    </div>
    <div class="text-white text-base font-medium truncate text-center w-full">
      {{ wordItem.to }}
    </div>
    <ion-button fill="clear">
      <ion-icon slot="icon-only" :icon="ellipsisVertical"/>
    </ion-button>
  </div>
</template>


<script setup lang="ts">
import {IonIcon, IonButton} from "@ionic/vue";
import {arrowForwardOutline, ellipsisVertical} from "ionicons/icons";

import {WordItem} from "@/types";

defineProps<{
  wordItem: WordItem;
}>();
</script>

<style scoped>

</style>