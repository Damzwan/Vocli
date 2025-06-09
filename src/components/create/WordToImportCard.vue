<template>
  <div
      class="w-full bg-card-background hover:bg-card-background-hover active:bg-card-background-active
       border-card-border hover:border-b-card-border-hover rounded-xl px-4 py-3 flex items-center justify-between space-x-4">
    <div class="flex justify-between items-center grow space-x-2">
      <div class="w-full flex justify-center">
        <ion-input
            v-if="isEditing"
            v-model="editedFrom"
            label="From"
            label-placement="floating"
            fill="outline"
        />
        <div v-else class="text-white text-base font-medium">
          {{ wordItem.from }}
        </div>
      </div>

      <div class="w-full flex justify-center">
        <ion-input
            v-if="isEditing"
            v-model="editedTo"
            label="To"
            label-placement="floating"
            fill="outline"
        />
        <div v-else class="text-white text-base font-medium text-right">
          {{ wordItem.to }}
        </div>
      </div>

    </div>

    <div>
      <ion-button fill="clear" @click="toggleEdit">
        <ion-icon slot="icon-only" :icon="isEditing ? closeOutline: createOutline"/>
      </ion-button>

      <ion-button fill="clear" color="danger" @click="emits('onDelete')">
        <ion-icon slot="icon-only" :icon="trashOutline"/>
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {IonButton, IonIcon, IonInput} from "@ionic/vue";
import {closeOutline, createOutline, trashOutline} from "ionicons/icons";

import {WordItem} from "@/types";

const props = defineProps<{
  wordItem: WordItem;
}>();

const emits = defineEmits<{
  (e: "onDelete"): void;
  (e: "onEdit", updated: WordItem): void;
}>();

const isEditing = ref(false);
const editedFrom = ref(props.wordItem.from);
const editedTo = ref(props.wordItem.to);

function toggleEdit() {
  if (isEditing.value) {
    emits("onEdit", {
      from: editedFrom.value.trim(),
      to: editedTo.value.trim(),
    });
  }
  isEditing.value = !isEditing.value;
}
</script>
