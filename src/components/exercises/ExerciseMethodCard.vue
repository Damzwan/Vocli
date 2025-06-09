<template>
  <div
      class="w-full bg-card-background hover:bg-card-background-hover active:bg-card-background-active border-card-border hover:border-b-card-border-hover transition-colors rounded-2xl p-4 cursor-pointer flex items-center justify-between group"
  >
    <!-- Left section: icon and text -->
    <div class="flex items-center space-x-4 text-zinc-200">
      <!-- Icon -->
      <ion-icon :icon="exerciseMethod.icon" class="text-4xl text-zinc-400 group-hover:text-white transition"/>

      <!-- Text content -->
      <div class="flex flex-col pl-1">
        <span class="text-2xl font-medium text-white">{{ t(`practice_methods.${exerciseMethod.id}`) }}</span>
        <span class="text-md text-zinc-400">{{ t(`practice_methods.${exerciseMethod.id}_description`) }}</span>
      </div>
    </div>

    <!-- Chevron to indicate click -->
    <ion-icon
        :icon="chevronForwardOutline"
        class="text-zinc-400 group-hover:text-white text-xl transition"
    />
  </div>
</template>


<script setup lang="ts">
import {PracticeMode} from "@/types";
import {IonIcon} from "@ionic/vue";
import {chevronForwardOutline} from "ionicons/icons";
import {useI18n} from "vue-i18n";

const {t} = useI18n()


defineProps<{
  exerciseMethod: PracticeMode
}>()
</script>


<style scoped>

</style>