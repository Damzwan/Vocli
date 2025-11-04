<template>
  <div
      class="rounded-2xl px-3 py-2 text-white shadow-lg flex items-center space-x-3 text-left"
      :style="{ backgroundColor: color }"
  >
    <!-- Icon -->
    <ion-icon :icon="icon" class="w-6 h-6 flex-shrink-0"></ion-icon>

    <!-- Text content -->
    <div class="flex flex-col gap-y-1">
      <div class="text-xl font-bold leading-none">{{ title }}</div>
      <div class="opacity-80 leading-none">{{ description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from "@ionic/vue";

defineProps<{
  color: string
  title: string
  description: string
  icon: string
}>()
</script>

<style scoped>
ion-icon {
  vertical-align: middle;
}
</style>
