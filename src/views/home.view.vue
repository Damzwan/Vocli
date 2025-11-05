<template>
  <ion-page class="max-w-[1000px] mx-auto">
    <ion-header>
      <ion-toolbar color="background">
        <div class="px-4 h-16 items-center flex justify-between">
          <p class="text-2xl font-bold">{{ t('home.title') }}</p>
          <div class="flex items-center">
            <ion-select @ionChange="(val) => {authStore.changeLocale(val.detail.value)}" :value="empty" ref="selectRef"
                        :okText="t('home.ok')"
                        :cancelText="t('home.cancel')">
              <img :src="LANGUAGE_FLAGS[user?.locale ?? locale as LANGUAGE]" alt="Language" width="26" slot="start"
                   class="cursor-pointer"
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
            <ion-button fill="clear" size="large" class="text-white ml-2" @click="feedbackModalOpen=true">
              <ion-icon slot="icon-only" :icon="chatbubblesOutline"/>
            </ion-button>
            <ion-button fill="clear" size="large" class="text-white ml-2" id="logout">
              <ion-icon slot="icon-only" :icon="logOutOutline"/>
            </ion-button>
          </div>

        </div>
      </ion-toolbar>

    </ion-header>
    <ion-content class="flex flex-col">
      <div class="w-full p-4 h-full">
        <div v-if="wordPacksLoading" class="w-full h-full flex justify-center items-center">
          <ion-spinner color="primary" class="w-[56px] h-[56px]"/>
        </div>
        <div v-else-if="wordPacks.length == 0" class="flex justify-center items-center h-11/12 flex-col space-y-4">
          <p class="text-2xl text-center">{{ t("home.no_word_packs") }}</p>
          <ion-button @click="isCreateWordPackActionSheetOpen=true">{{ t("home.create") }}</ion-button>
        </div>
        <div v-else class="flex flex-col space-y-3">
          <WordPackCard
              v-for="wordPack in sortedWordPacks"
              :key="wordPack.id"
              :wordPack="wordPack"
              :notifications="wordPackToNotificationMap[wordPack.id] ?? []"
              @edit-click="onWordPackEditClick(wordPack)"
              @proceed="goToPractice(wordPack)"

              @mouseenter="mobilePlatform ? null : onWordPackHoverStart(wordPack, $event)"
              @mouseleave="mobilePlatform ? null :  onWordPackHoverLeave()"

              @touchstart="mobilePlatform ? onWordPackHoverStart(wordPack, $event) : null"
              @touchend="mobilePlatform? onWordPackHoverLeave() : null"
          />

        </div>
      </div>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="isCreateWordPackActionSheetOpen=true">
          <ion-icon :icon="add"/>
        </ion-fab-button>
      </ion-fab>

      <ion-action-sheet :is-open="isWordPackActionSheetOpen" :header="t('home.actions')"
                        @didDismiss="isWordPackActionSheetOpen = false" :buttons="actionSheetButtons"/>

      <ion-modal :initial-breakpoint="1" :breakpoints="[0, 1]" :is-open="isCreateWordPackActionSheetOpen"
                 @didDismiss="isCreateWordPackActionSheetOpen=false"
                 @willPresent="name=''">
        <div class="p-6 space-y-6 bg-neutral-900 text-white h-full rounded-t-2xl w-full">
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
            <ion-select v-model="knownLanguage" @ionChange="(e) => {
              knownLanguage = e.detail.value
              void authStore.changeLearnAndKnownLanguage(learnLanguage, knownLanguage)
            }"
                        :okText="t('home.ok')" :cancelText="t('home.cancel')"
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
            <ion-select v-model="learnLanguage" class="w-full bg-neutral-800 rounded-lg" :okText="t('home.ok')"
                        @ionChange="e => {
              learnLanguage = e.detail.value
              void authStore.changeLearnAndKnownLanguage(learnLanguage, knownLanguage)
            }"
                        :cancelText="t('home.cancel')"
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


      <PeekWordsModal :is-open="isHoveringOnWordPack" :word-pack="hoveringWordPack" :mouseY="mouseY"/>
      <NotificationModal/>
      <LogoutAlert/>

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
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonToolbar,
  modalController,
  useIonRouter
} from '@ionic/vue';
import {computed, ref, watch} from 'vue';
import {
  add,
  chatbubblesOutline,
  createOutline,
  logOutOutline,
  notificationsOutline,
  trashOutline
} from "ionicons/icons";
import {v4 as uuidv4} from 'uuid';
import {useVocabularyCreatorStore} from "@/states/vocabulary-creator.state";
import WordPackCard from "@/components/home/WordPackCard.vue";
import {WordPack} from "@/types";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
import {Preferences} from "@capacitor/preferences";
import {LANGUAGE, LANGUAGE_FLAGS} from "@/config/languages.config";
import {useAppStore} from "@/states/app.state";
import {useI18n} from "vue-i18n";
import {useAuthStore} from "@/states/auth.state";
import {FirebaseFirestore} from "@capacitor-firebase/firestore";
import PeekWordsModal from "@/components/home/PeekWordsModal.vue";
import {getExtendedPlatform, isNative} from "@/helpers/app.helper";
import NotificationModal from "@/components/home/NotificationModal.vue";
import {useNotificationStore} from "@/states/notification.state";
import LogoutAlert from "@/components/home/LogoutAlert.vue";

const router = useIonRouter()

const authStore = useAuthStore()
const {wordPacksLoading, wordPacks, authUser, user} = storeToRefs(useAuthStore())
const {wordPack: wordPackToEdit} = storeToRefs(useVocabularyCreatorStore())
const {wordPack} = storeToRefs(useVocabularyPracticeStore())
const {wordPackToNotificationMap} = storeToRefs(useNotificationStore())
const {feedbackModalOpen} = storeToRefs(useAppStore())

const isWordPackActionSheetOpen = ref<boolean>(false)
const isCreateWordPackActionSheetOpen = ref<boolean>(false)

const selectRef = ref<any>()

const {t, locale} = useI18n()

const empty = ref("")

// create vocabulary refs
const name = ref<string>("")
const learnLanguage = ref<LANGUAGE>(LANGUAGE.en)
const knownLanguage = ref<LANGUAGE>(LANGUAGE.it)

const hoveringWordPack = ref<WordPack>()
const isHoveringOnWordPack = ref(false)
let wordPackHoverTimeout: any
const mouseY = ref(0);

const platform = getExtendedPlatform()
const mobilePlatform = platform === 'native' || platform === 'nativeWeb'


watch(user, (newUserVal) => {
  if (!newUserVal) return;
  learnLanguage.value = newUserVal.learnLanguage
  knownLanguage.value = newUserVal.knownLanguage
})

const sortedWordPacks = computed(() => {
  return [...wordPacks.value].sort((a, b) => {
    const dateA = Math.max(
        new Date(a.lastPracticed || 0).getTime(),
        new Date(a.lastEdited || 0).getTime()
    );
    const dateB = Math.max(
        new Date(b.lastPracticed || 0).getTime(),
        new Date(b.lastEdited || 0).getTime()
    );
    return dateB - dateA; // descending order (most recent first)
  });
});


function onWordPackEditClick(clickedWordPack: WordPack) {
  isWordPackActionSheetOpen.value = true
  wordPack.value = clickedWordPack
}

function goToPractice(clickedWordPack: WordPack) {
  wordPack.value = clickedWordPack

  // otherwise clunky ui
  setTimeout(() => {
    const {updateLastPracticed} = useVocabularyPracticeStore()
    updateLastPracticed()
  }, 200)

  router.push(`practice/${clickedWordPack.id}`)
}

async function onCreateWordPack() {
  if (!user.value) return;
  const newId = uuidv4()
  wordPackToEdit.value = {
    id: newId,
    name: name.value,
    lastEdited: new Date().toISOString(),
    learnLanguage: learnLanguage.value,
    knownLanguage: knownLanguage.value,
    words: []
  }


  await Preferences.set({key: "wordPackId", value: newId})
  modalController.dismiss()
  router.push(`create`)
}

function editWordPack() {
  if (!wordPack.value) return;
  wordPackToEdit.value = wordPack.value
  Preferences.set({key: "wordPackId", value: wordPack.value.id})
  router.push(`create`)
}


function deleteWordPack() {
  if (!wordPack.value) return;

  Preferences.remove({key: `pack-${wordPack.value.id}`})
  Preferences.remove({key: "wordPackId"})
  wordPacks.value = wordPacks.value.filter((p) => p.id !== wordPack.value!.id)

  FirebaseFirestore.deleteDocument({
    reference: `wordPacks/${authUser.value.uid}/packs/${wordPack.value.id}`,
  });

  FirebaseFirestore.deleteDocument({
    reference: `wordPacks/${authUser.value.uid}/metadata/${wordPack.value.id}`,
  });


  const {showToast} = useAppStore()
  showToast(t('toast.deleted_successfully'), {color: 'success', duration: 500})
}


function onWordPackHoverStart(pack: WordPack, e: MouseEvent | TouchEvent) {
  wordPackHoverTimeout = setTimeout(() => {
    hoveringWordPack.value = pack
    isHoveringOnWordPack.value = true

    if ('clientY' in e) {
      // MouseEvent
      mouseY.value = e.clientY
    } else if (e.touches && e.touches.length > 0) {
      // TouchEvent
      mouseY.value = e.touches[0].clientY
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      // fallback for touchend
      mouseY.value = e.changedTouches[0].clientY
    }

  }, isNative() ? 0 : 500)
}


function onWordPackHoverLeave() {
  clearTimeout(wordPackHoverTimeout)
  isHoveringOnWordPack.value = false
}


const actionSheetButtons = computed(() => [
  {
    text: t('home.edit'),
    icon: createOutline,
    handler: editWordPack
  },
  {
    text: "Notifications",
    icon: notificationsOutline,
    id: "notification-modal",
  },
  {
    text: t('home.delete'),
    icon: trashOutline,
    role: 'destructive',
    id: "open-delete-wordpack-alert",
    cssClass: 'delete'
  },

]);

const alertButtons = computed(() => [
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
