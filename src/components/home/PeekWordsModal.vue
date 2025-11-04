<template>
  <!-- Conditional backdrop behind modal -->
  <div
      v-show="isOpen && wordPack"
      class="fixed left-0 right-0 z-40 bg-black/80 transition-opacity duration-300 h-[45vh] animate-fade max-w-[1000px]"
      :class="{
      'top-[5%] h-[10%]': !showBottomHalf,
      'bottom-0 h-[40%]': showBottomHalf
    }"
  ></div>

  <!-- Modal -->
  <div
      v-show="isOpen && wordPack"
      class="fixed z-50 w-[90vw] h-[35vh] rounded-2xl p-4 shadow-xl duration-300 bg-card-background pointer-events-none animate-fade left-1/2 max-w-[800px]"
      :class="{
      'opacity-100': isOpen,
      'opacity-0': !isOpen,
      'top-[10%]': !showBottomHalf,
      'bottom-[7%]': showBottomHalf
    }"
      :style="{ transform: 'translateX(-50%)' }"
  >
    <div
        ref="scrollContainer"
        class="h-full overflow-y-hidden py-2"
    >
      <div
          v-for="(word, index) in wordPack?.words"
          :key="index"
          class="py-1 text-sm text-white"
      >
        {{ word.from }} - {{ word.to }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import type { WordPack } from "@/types";

const props = defineProps<{
  isOpen: boolean;
  wordPack?: WordPack;
  mouseY?: number;
}>();

const scrollContainer = ref<HTMLDivElement | null>(null);

const showBottomHalf = computed(() => {
  if (!props.mouseY) return false;
  return props.mouseY < window.innerHeight / 2;
});

let scrollInterval: any;

watch(props, () => {
  if (props.isOpen) startScroll();
  else stopScroll();
});

const startScroll = () => {
  if (!scrollContainer.value) return;

  const el = scrollContainer.value;
  el.scrollTop = 0; // restart scroll
  stopScroll();

  scrollInterval = setInterval(() => {
    el.scrollTop += el.scrollTop + el.clientHeight >= el.scrollHeight ? 0 : 1;
  }, 50);
};

const stopScroll = () => {
  const el = scrollContainer.value;
  if (el) el.scrollTop = 0; // restart scroll
  if (scrollInterval) clearInterval(scrollInterval);
};

onBeforeUnmount(stopScroll);
</script>
