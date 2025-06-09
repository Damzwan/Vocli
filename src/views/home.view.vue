<template>
  <ion-page class="max-w-[1000px] mx-auto">
    <ion-content>
      <div class="px-4 h-16 items-center flex justify-between">
        <p class="text-2xl font-bold">{{ t('home.title') }}</p>
        <div class="flex items-center">
          <ion-select @ionChange="changeLanguage" :value="empty" ref="selectRef" :okText="t('home.ok')" :cancelText="t('home.cancel')">
            <img :src="LANGUAGE_FLAGS[locale]" alt="Language" width="26" slot="start" class="cursor-pointer"
                 @click="selectRef?.$el.open()">
            <ion-select-option
                v-for="language in Object.values(LANGUAGE).sort((a, b) => t(`languages.${a}`).localeCompare(t(`languages.${b}`)))"
                :key="language"
                :value="language"
            >
              <div class="flex items-center space-x-3">
                <img :src="LANGUAGE_FLAGS[language]" alt="" class="w-5 h-5 rounded"/>
                <span class="text-white">{{ t(`languages.${language}`) }}</span>
              </div>
            </ion-select-option>
          </ion-select>
          <ion-button fill="clear" size="large" class="text-white ml-2" id="feedback">
            <ion-icon slot="icon-only" :icon="chatbubblesOutline"/>
          </ion-button>
        </div>

      </div>


      <div class="w-full h-full p-4">
        <div v-if="isLoading" class="w-full h-full flex justify-center items-center">
          <ion-spinner color="primary" class="w-[56px] h-[56px]"/>
        </div>
        <div v-else-if="wordPacks.length == 0" class="flex justify-center items-center h-11/12 flex-col space-y-4">
          <p class="text-2xl text-center">{{ t("home.no_word_packs") }}</p>
          <ion-button @click="isCreateWordPackActionSheetOpen=true">{{ t("home.create") }}</ion-button>
        </div>
        <div v-else class="flex flex-col space-y-3">
          <WordPackCard v-for="wordPack in wordPacks" :key="wordPack.id" :wordPack="wordPack"
                        @click="() => onWordPackClick(wordPack)"/>
        </div>
      </div>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="isCreateWordPackActionSheetOpen=true" :router-animation="iosTransitionAnimation">
          <ion-icon :icon="add"/>
        </ion-fab-button>
      </ion-fab>

      <ion-action-sheet :is-open="isWordPackActionSheetOpen" :header="t('home.actions')"
                        @didDismiss="isWordPackActionSheetOpen = false" :buttons="actionSheetButtons"/>

      <ion-modal :initial-breakpoint="1" :breakpoints="[0, 1]" :is-open="isCreateWordPackActionSheetOpen"
                 @didDismiss="isCreateWordPackActionSheetOpen=false"
                 @willPresent="name=''">
        <div class="p-6 space-y-6 bg-neutral-900 text-white h-full rounded-t-2xl w-full h-full">
          <p class="text-2xl font-bold">{{ t("home.customize_word_pack") }}</p>

          <!-- Word Pack Name Input -->
          <div>
            <label class="text-sm font-medium text-gray-300 mb-3 block">{{ t("home.name") }}</label>
            <ion-input
                @keyup.enter="onCreateWordPack"
                v-model="name"
                :placeholder="t('home.name_example')"
                class="w-full bg-neutral-800 text-white rounded-lg px-3 py-2"
                style="--padding-start: 1rem;"
            />
          </div>

          <!-- Known Language Select -->
          <div>
            <label class="text-sm font-medium text-gray-300 mb-3 block">{{ t("home.knownLanguage") }}</label>
            <ion-select v-model="knownLanguage" @ionChange="(e) => knownLanguage = e.detail.value" :okText="t('home.ok')" :cancelText="t('home.cancel')"
                        class="w-full bg-neutral-800 rounded-lg" style="--padding-start: 1rem;">
              <ion-icon slot="start" :icon="LANGUAGE_FLAGS[knownLanguage]" class="mr-3" aria-hidden="true"/>

              <ion-select-option
                  v-for="language in Object.values(LANGUAGE).sort((a, b) => t(`languages.${a}`).localeCompare(t(`languages.${b}`)))"

                  :key="language"
                  :value="language"
              >
                <div class="flex items-center space-x-3">
                  <img :src="LANGUAGE_FLAGS[language]" alt="" class="w-5 h-5 rounded"/>
                  <span class="text-white">{{ t(`languages.${language}`) }}</span>
                </div>
              </ion-select-option>
            </ion-select>
          </div>

          <!-- Learn Language Select -->
          <div>
            <label class="text-sm font-medium text-gray-300 mb-3 block">{{ t("home.learnLanguage") }}</label>
            <ion-select v-model="learnLanguage" class="w-full bg-neutral-800 rounded-lg" :okText="t('home.ok')" :cancelText="t('home.cancel')"
                        style="--padding-start: 1rem;">
              <ion-icon slot="start" :icon="LANGUAGE_FLAGS[learnLanguage]" class="mr-3" aria-hidden="true"/>
              <ion-select-option
                  v-for="language in Object.values(LANGUAGE).sort((a, b) => t(`languages.${a}`).localeCompare(t(`languages.${b}`)))"
                  :key="language"
                  :value="language"
              >
                <div class="flex items-center space-x-3">
                  <img :src="LANGUAGE_FLAGS[language]" alt="" class="w-5 h-5 rounded"/>
                  <span class="text-white">{{ t(`languages.${language}`) }}</span>
                </div>
              </ion-select-option>
            </ion-select>
          </div>

          <!-- Create Button -->
          <ion-button expand="block" @click="onCreateWordPack" class="mt-4">
            {{ t("home.create") }}
          </ion-button>
        </div>
      </ion-modal>

      <ion-alert
          trigger="open-delete-wordpack-alert"
          :header="t('home.delete_alert.title')"
          :message="t('home.delete_alert.subtitle')"
          :buttons="alertButtons"
      />


      <FeedbackModal/>

    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import {
  IonActionSheet,
  IonAlert,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInput,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  iosTransitionAnimation,
  modalController,
  onIonViewWillEnter,
  useIonRouter
} from '@ionic/vue';
import {computed, ref} from 'vue';
import {add, americanFootballOutline, chatbubblesOutline, createOutline, trashOutline} from "ionicons/icons";

import {useVocabularyCreatorStore} from "@/states/vocabulary-creator.state";
import WordPackCard from "@/components/home/WordPackCard.vue";
import {WordPack} from "@/types";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
import {Preferences} from "@capacitor/preferences";
import {LANGUAGE, LANGUAGE_FLAGS} from "@/config/languages.config";
import {useAppStore} from "@/states/app.state";
import FeedbackModal from "@/components/home/FeedbackModal.vue";
import {useI18n} from "vue-i18n";

const wordPacks = ref<WordPack[]>([])
const router = useIonRouter()

const {fetchWordPacks} = useVocabularyCreatorStore()
const {knownLanguage, learnLanguage, name, wordItems} = storeToRefs(useVocabularyCreatorStore())
const {wordPack} = storeToRefs(useVocabularyPracticeStore())
const isLoading = ref(true);

const isWordPackActionSheetOpen = ref<boolean>(false)
const isCreateWordPackActionSheetOpen = ref<boolean>(false)

const selectRef = ref<any>()

const {t, locale} = useI18n()

const empty = ref("")

onIonViewWillEnter(async () => {
  isLoading.value = true
  wordPacks.value = await fetchWordPacks()
  isLoading.value = false
})

function onWordPackClick(clickedWordPack: WordPack) {
  isWordPackActionSheetOpen.value = true
  wordPack.value = clickedWordPack
}

function goToPractice() {
  router.push(`practice`, iosTransitionAnimation)
}

async function onCreateWordPack() {
  wordItems.value = []
  await Preferences.remove({key: "wordPackId"})
  modalController.dismiss()
  router.push(`create`, iosTransitionAnimation)
}

function editWordPack() {
  if (!wordPack.value) return;
  Preferences.set({key: "wordPackId", value: wordPack.value.id})
  knownLanguage.value = wordPack.value.knownLanguage
  learnLanguage.value = wordPack.value.learnLanguage
  name.value = wordPack.value.name
  router.push(`create`, iosTransitionAnimation)
}

function deleteWordPack() {
  if (!wordPack.value) return;
  Preferences.remove({key: `pack_${wordPack.value.id}`})
  Preferences.remove({key: "wordPackId"})
  wordPacks.value = wordPacks.value.filter((p) => p.id !== wordPack.value!.id)

  const {showToast} = useAppStore()
  showToast(t('toast.deleted_successfully'), {color: 'success', duration: 500})
}

function changeLanguage(val: any) {
  locale.value = val.detail.value
  Preferences.set({key: "locale", value: locale.value})
}


const actionSheetButtons = computed((locale) => [
  {
    text: t('home.practice'),
    icon: americanFootballOutline,
    handler: goToPractice
  },
  {
    text: t('home.edit'),
    icon: createOutline,
    handler: editWordPack
  },
  {
    text: t('home.delete'),
    icon: trashOutline,
    role: 'destructive',
    id: "open-delete-wordpack-alert",
    cssClass: 'delete'
  },

]);

const alertButtons = computed((locale) => [
  {
    text: t('home.delete_alert.cancel'),
    role: 'cancel',
  },
  {
    text: t('home.delete_alert.confirm'),
    role: 'confirm',
    handler: deleteWordPack,
  },
])

</script>

<style scoped>
ion-modal {
  --height: auto;
}


</style>
