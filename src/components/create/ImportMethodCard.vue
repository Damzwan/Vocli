<template>
  <div
      class="w-42 h-36 p-4 rounded-2xl flex flex-col justify-between transition-all duration-200 cursor-pointer
           hover:scale-[1.03] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
      :style="{ backgroundColor: importMethod.color }"
  >
    <div class="text-3xl">{{ importMethod.icon }}</div>
    <div>
      <p class="text-lg font-semibold">{{ importMethod.title }}</p>
      <p class=" opacity-80 leading-tight">{{ importMethod.subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ImportMethod} from "@/types"

defineProps<{
  importMethod: ImportMethod
}>()
</script>
