<template>
  <ion-modal trigger="notification-modal" :initial-breakpoint="1" :breakpoints="[0, 1]"
             @willPresent="fetchNotificationInfo">
    <div v-if="wordPack" class="p-4">
      <p>Notifications for {{ wordPack.name }}:</p>
      <div class="pt-4">
        <ion-list>
          <ion-item
              v-for="(item, index) in wordPackNotificationInfo"
              :key="index"
              lines="inset"
          >
            <ion-label>
              {{ formatDate(item.startDate) }} → {{ formatDate(item.endDate) }}
              <span class="text-gray-300 ml-2">⏰ {{ item.time }}</span>
            </ion-label>

            <!-- delete button on the same row -->
            <ion-button
                slot="end"
                fill="clear"
                color="danger"
                @click="deleteNotification(index)"
            >
              <ion-icon :icon="trashOutline" slot="icon-only"/>
            </ion-button>
          </ion-item>

          <ion-item button id="create-notification-modal">
            <div class="flex justify-center items-center w-full">
              <ion-button fill="clear">
                <ion-icon slot="icon-only" :icon="addOutline"/>
              </ion-button>
            </div>
          </ion-item>
        </ion-list>

      </div>
    </div>

    <ion-modal id="create-notification-modal" ref="modal" trigger="create-notification-modal">
      <div class="p-4">
        <p>Create Notification</p>
        <p v-if="amountOfDaysActive == 0">
          Active only today
        </p>
        <p v-else>Active for {{ amountOfDaysActive }} days</p>
        <ion-datetime presentation="date-time" v-model="newNotificationTime" :min="new Date().toString()"
                      :prefer-wheel="true"/>
      </div>

      <div class="flex justify-end item-center">
        <ion-button fill="clear" @click="modalController.dismiss()">
          Cancel
        </ion-button>

        <ion-button fill="clear" @click="addNotification" :disabled="new Date(newNotificationTime) < new Date()">
          Add
        </ion-button>

      </div>
    </ion-modal>
  </ion-modal>
</template>

<script setup lang="ts">
import {IonModal, modalController, IonItem, IonButton, IonIcon, IonDatetime, IonList, IonLabel} from "@ionic/vue";
import {storeToRefs} from "pinia";
import {useVocabularyPracticeStore} from "@/states/vocabulary-practice.state";
import {computed, ref, watch} from "vue";
import {WordPackNotificationItem} from "@/types";
import {useNotificationStore} from "@/states/notification.state";
import {useAppStore} from "@/states/app.state";
import {addOutline, trashOutline} from "ionicons/icons";
import dayjs from "dayjs";
import {LocalNotifications} from "@capacitor/local-notifications";

const {wordPack} = storeToRefs(useVocabularyPracticeStore())
const wordPackNotificationInfo = ref<WordPackNotificationItem[]>([])
const amountOfDaysActive = computed(() => {
  const target = new Date(newNotificationTime.value).getTime();
  if (isNaN(target)) return 0;

  const msDiff = target - Date.now(); // positive if in the future
  const days = Math.round(msDiff / (1000 * 60 * 60 * 24)); // round up partial days
  return Math.max(0, days);
});


function formatDate(dateString: string) {
  return dayjs(dateString).format("MMM D, YYYY");
}


const notificationStore = useNotificationStore()

const initialDateTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(16, 0, 0, 0); // 16:00 = 4 PM
  return tomorrow.toISOString();
};
const newNotificationTime = ref<string>(initialDateTime())


async function fetchNotificationInfo() {
  if (!wordPack.value) return
  const {fetchNotificationInfoForWordPack, isAllowed, askPermission} = notificationStore

  if (!isAllowed) {
    const newAllowed = await askPermission()
    if (!newAllowed) {
      modalController.dismiss()
      const {showToast} = useAppStore()
      showToast('Permission denied', {color: 'danger'})
      return
    }
  }

  wordPackNotificationInfo.value = await fetchNotificationInfoForWordPack(wordPack.value.id)
}


function addNotification() {
  if (!wordPack.value) return
  const now = new Date();
  const end = new Date(newNotificationTime.value);

  // Format as YYYY-MM-DD (without hours)
  const toDateOnly = (date: Date) => date.toISOString().split("T")[0];

  // Format as HH:mm
  const toTimeOnly = (date: Date) =>
      date.toTimeString().slice(0, 5); // e.g. "14:30"


  wordPackNotificationInfo.value.push({
    startDate: toDateOnly(now),
    endDate: end.toISOString(),
    time: toTimeOnly(end),
  });

  notificationStore.syncNotificationsForWordPack(wordPack.value, wordPackNotificationInfo.value).then(
      () => {
        const {showToast} = useAppStore()
        showToast('Notification added', {color: 'success'})
      }
  )
  modalController.dismiss()
}

function deleteNotification(i: number) {
  if (!wordPack.value) return
  wordPackNotificationInfo.value = wordPackNotificationInfo.value.filter((_, index) => index !== i);
  notificationStore.syncNotificationsForWordPack(wordPack.value, wordPackNotificationInfo.value).then(
      () => {
        const {showToast} = useAppStore()
        showToast('Notification deleted', {color: 'success'})
      }
  )
}


</script>

<style scoped>
ion-modal {
  --height: auto;
}

ion-modal#create-notification-modal {
  --width: fit-content;
  --min-width: 250px;
  --height: fit-content;
}
</style>