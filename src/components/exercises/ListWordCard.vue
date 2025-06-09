<template>
  <div
      class="w-full bg-card-background hover:bg-card-background-hover active:bg-card-background-active border-card-border hover:border-b-card-border-hover rounded-xl px-4 py-3 grid grid-cols-2 gap-4 items-center">
    <!-- From word with TTS -->
    <div class="flex items-center justify-center space-x-2">
      <div class="text-white text-xl font-medium text-center cursor-pointer" @click="localHideLeft=!localHideLeft"
           v-html="localHideLeft ? unknown : getHighlightedParts(wordItem.from)">
      </div>
    </div>

    <!-- To word with TTS -->
    <div class="flex items-center justify-center space-x-2">
      <div class="text-white text-xl font-medium text-center cursor-pointer" @click="localHideRight=!localHideRight"
           v-html="localHideRight ? unknown : getHighlightedParts(wordItem.to)">
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import {WordItem} from "@/types";
import {ref, watch} from "vue";
import {sanitize} from "@/helpers/exercises";

const localHideLeft = ref(false)
const localHideRight = ref(false)

const props = defineProps<{
  wordItem: WordItem;
  hideLeft?: boolean;
  hideRight?: boolean;
  highlightedWord?: string;
}>();

function getHighlightedParts(text: string): string {
  if (!props.highlightedWord) return text;

  const search = sanitize(props.highlightedWord)
  const textLower = sanitize(text)

  const index = textLower.indexOf(search);
  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + search.length);
  const after = text.slice(index + search.length);

  // Return as HTML with span around the match
  return `${before}<span class="bg-yellow-500">${match}</span>${after}`;
}


watch(() => props.hideLeft, (newVal) => {
  localHideLeft.value = newVal;
})

watch(() => props.hideRight, (newVal) => {
  localHideRight.value = newVal;
});


const unknown = "*******"
</script>

<style scoped>

</style>