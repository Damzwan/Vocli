<template>
  <ion-modal ref="modal" :is-open="isOpen" :initial-breakpoint="1" :breakpoints="[0, 1]" @did-dismiss="closeModal"
             @will-present="beforeOpen">

    <div class="p-6 bg-background" v-if="wordItem">
      <p class="text-2xl">{{t(`${tPrefix}.title`)}}</p>

      <div class="bg-background-card rounded-xl p-3 space-y-4 mt-4">
        <ion-input v-model="from" class="rounded-lg">
          <ion-icon slot="start" class="px-3" :icon="LANGUAGE_FLAGS[wordPack?.knownLanguage ?? LANGUAGE.en]"/>
          <ion-icon slot="end" class="px-3" :icon="createOutline"/>
        </ion-input>

        <ion-input v-model="to" class="rounded-lg">
          <ion-icon slot="start" class="px-3" :icon="LANGUAGE_FLAGS[wordPack?.learnLanguage ?? LANGUAGE.it]"/>
          <ion-icon slot="end" class="px-3" :icon="createOutline"/>
        </ion-input>
      </div>

      <ion-button expand="block" shape="round" color="danger" id="present-delete-word-alert" class="py-4">{{t(`${tPrefix}.delete`)}}
      </ion-button>
      <ion-button expand="block" shape="round" @click="confirm">{{t(`${tPrefix}.confirm`)}}</ion-button>


    </div>

    <ion-alert
        class="z-[9999]"
        trigger="present-delete-word-alert"
        header="Delete word"
        message="Are you sure you want to delete word?"
        :buttons=alertButtons
    />
  </ion-modal>
</template>

<script setup lang="ts">
import {IonModal, IonIcon, IonButton, IonAlert, AlertButton, IonInput} from "@ionic/vue";
import {createOutline} from "ionicons/icons";


import {ref} from "vue";
import {WordItem} from "@/types";
import {LANGUAGE, LANGUAGE_FLAGS} from "@/config/languages.config";
import {storeToRefs} from "pinia";
import {useVocabularyCreatorStore} from "@/states/vocabulary-creator.state";
import {useI18n} from "vue-i18n";

const modal = ref<any>();

const from = ref<string>("");
const to = ref<string>("");

const {wordPack} = storeToRefs(useVocabularyCreatorStore())

const props = defineProps<{
  isOpen: boolean;
  wordItem: WordItem | undefined;
}>()

const didDelete = ref<boolean>(false);

const {t} = useI18n()
const tPrefix = "create.edit"



const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'word-edited', from: string, to: string): void;
  (e: 'delete'): void;
}>();

function beforeOpen() {
  if (!props.wordItem) return
  from.value = props.wordItem.from;
  to.value = props.wordItem.to;
  didDelete.value = false;
}

function closeModal() {
  emit('update:isOpen', false);
}

const alertButtons: AlertButton[] = [{text: "Cancel"}, {
  text: "Confirm", handler: () => {
    didDelete.value = true
    emit("delete")
    closeModal()
  }
}];


function confirm() {
  emit('word-edited', from.value, to.value);
  closeModal()
}

</script>

<style scoped>
ion-modal {
  --height: auto;
}

ion-input {
  background-color: var(--color-card-background);
}
</style>