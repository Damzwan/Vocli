<template>
  <div
      class="rounded-2xl p-2 text-white shadow-lg flex flex-col items-center justify-center flex text-center"
      :style="{ backgroundColor: color }"
  >
    <ion-icon :icon="icon" class="mb-2"></ion-icon>
    <div class="text-2xl font-bold">{{ title }}</div>
    <div class="text-lg">{{ description }}</div>
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
  width: 32px;
  height: 32px;
}
</style>
