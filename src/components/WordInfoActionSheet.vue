<template>
  <ion-modal
      :is-open="wordInfoActionSheetOpen"
      @didDismiss="store.close"
      :initial-breakpoint="1"
      :breakpoints="[0, 1]"
  >
    <div class="flex flex-col items-center justify-center p-6 space-y-4">

      <!-- ❌ Error -->
      <p v-if="error" class="text-red-500 text-center">
        Something went wrong: {{ error }}
      </p>

      <!-- 🔄 Loading -->
      <div v-else-if="loading" class="flex justify-center py-6">
        <ion-spinner color="primary"/>
      </div>

      <!-- ✅ Content -->
      <div v-else-if="wordInfoInput && wordInfoRes" class="flex flex-col items-center space-y-4 w-full">

        <!-- Word info -->
        <div class="text-center space-y-1">
          <p class="text-4xl font-bold">{{ wordInfoInput.learnWord }}</p>
          <div class="flex flex-wrap justify-center gap-1 mt-2">
              <span
                  v-for="pos in wordInfoRes.partOfSpeech"
                  :key="pos"
                  class="text-xs uppercase text-gray-400 px-2 py-0.5 border rounded-lg"
              >
                {{ pos }}
              </span>
          </div>
          <p class="text-2xl font-semibold mt-2 text-gray-400">{{ wordInfoInput.knownWord }}</p>
        </div>

        <!-- 🔹 Selector chips (only show if data exists) -->
        <div class="flex justify-center flex-wrap gap-4 mt-4">
          <ion-chip
              v-for="option in availableChips"
              :key="option.value"
              :outline="selectedChip !== option.value"
              color="primary"
              class="px-4 py-2 cursor-pointer"
              @click="selectedChip = option.value"
          >
            <ion-icon :icon="option.ionIcon" class="mr-2"></ion-icon>
            {{ option.title }}
          </ion-chip>
        </div>

        <!-- 🔹 Display content based on selected chip -->
        <div v-if="selectedChip === 'examples'" class="flex flex-col gap-2 mt-4 w-full max-w-md">
          <div v-for="(ex, i) in wordInfoRes.examples" :key="i" class="space-y-1">
            <p class="font-medium ">{{ ex.learnLanguageSentence }}</p>
            <p class="text-sm text-gray-400">{{ ex.translation }}</p>
          </div>
        </div>

        <div v-else-if="selectedChip === 'synonyms'" class="flex flex-wrap gap-3 mt-4 justify-center">
          <ion-chip
              v-for="(syn, i) in wordInfoRes.synonyms"
              :key="i"
              color="secondary"
              class="px-3 py-2"
          >
            {{ syn }}
          </ion-chip>
        </div>

        <div v-else-if="selectedChip === 'antonyms'" class="flex flex-wrap gap-3 mt-4 justify-center">
          <ion-chip
              v-for="(ant, i) in wordInfoRes.antonyms"
              :key="i"
              color="tertiary"
              class="px-3 py-2"
          >
            {{ ant }}
          </ion-chip>
        </div>
      </div>

      <!-- ℹ️ Empty -->
      <p v-else class="text-center text-gray-400">No word selected.</p>

    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import {IonModal, IonChip, IonSpinner, IonIcon, IonContent} from "@ionic/vue";
import {storeToRefs} from "pinia";
import {useWordInfoStore} from "@/states/wordInfo.state";
import {computed, ref, watch} from "vue";

type SelectOption = "examples" | "synonyms" | "antonyms";

const store = useWordInfoStore();
const {wordInfoActionSheetOpen, loading, wordInfoRes, error, wordInfoInput} =
    storeToRefs(store);

// Selected chip
const selectedChip = ref<SelectOption>("examples");

// Chip options with title, icon, and value
import {bookOutline, gitCompareOutline, swapHorizontalOutline} from "ionicons/icons";

const chipOptions = [
  {title: "Examples", ionIcon: bookOutline, value: "examples" as SelectOption},
  {title: "Synonyms", ionIcon: gitCompareOutline, value: "synonyms" as SelectOption},
  {title: "Antonyms", ionIcon: swapHorizontalOutline, value: "antonyms" as SelectOption},
];

const availableChips = computed(() => {
  return chipOptions.filter(option => hasData(option.value));
});

// Reset chip selection whenever a new word is opened
watch(wordInfoInput, () => {
  selectedChip.value = "examples";
});

// Helper: check if the data exists before showing chip
function hasData(option: SelectOption) {
  if (!wordInfoRes.value) return false;
  if (option === "examples") return wordInfoRes.value.examples && wordInfoRes.value.examples.length > 0;
  if (option === "synonyms") return wordInfoRes.value.synonyms && wordInfoRes.value.synonyms.length > 0;
  if (option === "antonyms") return wordInfoRes.value.antonyms && wordInfoRes.value.antonyms.length > 0;
  return false;
}
</script>

<style scoped>
.text-muted-foreground {
  color: rgba(100, 100, 100, 0.8);
}

ion-modal {
  --height: auto;
}
</style>
