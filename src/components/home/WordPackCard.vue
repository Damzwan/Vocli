<template>
  <div
      @click="emit('proceed')"
      class="group w-full bg-card-background hover:bg-card-background-hover active:bg-card-background-active border border-card-border hover:border-card-border-hover
           transition-colors rounded-2xl p-4 cursor-pointer flex items-center justify-between"
  >
    <div class="flex flex-col space-y-2 text-zinc-200">
      <div class="text-sm text-zinc-400 flex items-center space-x-2">
        <span>{{ wordCountText }} • {{ formattedLastActivity }}</span>
        <div v-if="notifications.length > 0" class="flex items-center space-x-1">
          <p class="text-primary m-0">{{ notifications.length }}</p>
          <ion-icon :icon="notificationsOutline" color="primary"/>
        </div>
      </div>


      <!-- Title + Flags Row -->
      <div class="flex items-center  space-x-4">
        <h3 class="text-2xl font-semibold text-white truncate">
          {{ wordPack.name }}
        </h3>

        <div class="flex space-x-2 shrink-0">
          <img
              v-for="(lang, i) in [wordPack.knownLanguage, wordPack.learnLanguage]"
              :key="i"
              :src="LANGUAGE_FLAGS[lang]"
              :alt="`${lang} flag`"
              class="w-6 h-6 rounded-full object-cover border border-zinc-600 pointer-events-none"
          />
        </div>
      </div>
    </div>

    <!-- Right icon -->
    <ion-button
        fill="clear"
        @click.stop="emit('edit-click')"
        class="z-10"
        aria-label="Edit word pack"
    >
      <ion-icon
          :icon="ellipsisVertical"
          class="text-zinc-400 group-hover:text-white text-2xl transition"
      ></ion-icon>
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import {WordPack, WordPackNotificationItem} from "@/types"
import {IonIcon, IonButton} from "@ionic/vue"
import {ellipsisVertical, notificationsOutline} from "ionicons/icons"
import dayjs from "dayjs"
import {LANGUAGE_FLAGS} from "@/config/languages.config"
import {useI18n} from "vue-i18n"
import {computed} from "vue";

const props = defineProps<{ wordPack: WordPack, notifications: WordPackNotificationItem[] }>()
const emit = defineEmits(["edit-click", "proceed"])
const {t} = useI18n()


const formattedLastActivity = computed(() => {
  const lastDate = Math.max(
      new Date(props.wordPack.lastPracticed || 0).getTime(),
      new Date(props.wordPack.lastEdited || 0).getTime()
  );
  return dayjs(lastDate).format("MMM D, YYYY")
});


const wordCountText = computed(() =>
    `${props.wordPack.words?.length} ${t("home.word_pack_card.words")}`
)
</script>

<style scoped>
/* Optional: smooth hover scaling */
.group:hover {
  transform: translateY(-1px);
  transition: transform 0.15s ease, background-color 0.2s ease;
}
</style>
