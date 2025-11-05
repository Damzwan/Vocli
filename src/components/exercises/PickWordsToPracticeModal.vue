<template>
  <ion-modal :is-open="isOpen" @didDismiss="isOpen=false" @willPresent="init">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="modalController.dismiss()">Cancel</ion-button>
        </ion-buttons>
        <ion-title>Select Words ({{ selectedWords.length }})</ion-title>
        <ion-buttons slot="end">
          <ion-button :strong="true" @click="confirmSelection">Confirm</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="w-full h-full p-4">
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-lg font-semibold">Selected</h2>

            <ion-button
                fill="clear"
                v-if="selectedWords.length > 0"
                @click="selectedWords = []"
                class="text-sm text-red-500 hover:text-red-600 transition"
            >
              Clear all
            </ion-button>
          </div>

          <div class="flex flex-wrap gap-2">
            <ion-chip
                v-for="word in selectedWords"
                :key="'selected-' + word.from"
                color="primary"
                class="cursor-pointer transition hover:opacity-80 p-2"
                @click="toggleSelection(word)"
            >
              {{ word.from }} - {{ word.to }}
              <ion-icon :icon="closeOutline" class="text-white"/>
            </ion-chip>
            <p v-if="!selectedWords.length" class="text-sm text-gray-400 italic">No words selected</p>
          </div>
        </div>

        <!-- All Options -->
        <div>
          <h2 class="text-lg font-semibold mb-2">Available</h2>
          <div class="flex flex-wrap gap-2">
            <ion-chip
                v-for="word in wordPack?.words"
                :key="word.from"
                class="cursor-pointer transition p-2"
                :class="isSelected(word) ? 'bg-blue-500 text-white' : 'bg-blue-900 hover:bg-blue-800'"
                @click="toggleSelection(word)"
            >
              {{ word.from }} - {{ word.to }}
            </ion-chip>
          </div>
        </div>
      </div>

    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
  modalController,
} from "@ionic/vue";
import {ref} from "vue";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
import {closeOutline} from "ionicons/icons";
import {WordItem} from "@/types";

const isOpen = defineModel<boolean>('isOpen', {default: false})

const {wordsToPractice, wordPack} = storeToRefs(useVocabularyPracticeStore());

const selectedWords = ref<WordItem[]>([]);

const isSelected = (word: WordItem) => {
  return selectedWords.value.some((w) => w.from === word.from);
};

const toggleSelection = (word: WordItem) => {
  if (isSelected(word)) {
    selectedWords.value = selectedWords.value.filter((w) => w.from !== word.from);
  } else {
    selectedWords.value.push(word);
  }
};

const confirmSelection = () => {
  wordsToPractice.value = selectedWords.value;
  modalController.dismiss();
};

function init() {
  selectedWords.value = [...wordsToPractice.value];
}
</script>

<style scoped>

</style>
