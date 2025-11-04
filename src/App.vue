<template>
  <ion-app id="root">
    <div class="w-full h-full z-50 flex justify-center items-center bg-background" v-if="authLoading">
      <ion-spinner class="z-50" color="primary"/>
    </div>
    <ion-router-outlet/>
    <WordInfoActionSheet/>
    <FeedbackModal/>
    <ion-toast
        :is-open="isToastOpen"
        :message="toastMessage"
        :duration="toastOptions.duration"
        :color="toastOptions.color"
        @didDismiss="isToastOpen = false"
    ></ion-toast>
  </ion-app>
</template>

<script setup lang="ts">
import {IonApp, IonRouterOutlet, IonSpinner, IonToast} from '@ionic/vue';
import {storeToRefs} from "pinia";
import {useAppStore} from "@/states/app.state";
import {useAuthStore} from "@/states/auth.state";
import WordInfoActionSheet from "@/components/WordInfoActionSheet.vue";
import {watch} from "vue";
import {SplashScreen} from "@capacitor/splash-screen";
import FeedbackModal from "@/components/home/FeedbackModal.vue";


const appStore = useAppStore()
const {toastMessage, toastOptions, isToastOpen} = storeToRefs(appStore)

const authStore = useAuthStore()
const {authLoading} = storeToRefs(authStore)

authStore.initAuthListener()
appStore.initShake()


watch(authLoading, () => {
  if (!authLoading.value) SplashScreen.hide()
})


</script>


