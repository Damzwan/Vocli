<template>
  <ion-app id="root">
    <ion-router-outlet/>
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
import {IonApp, IonRouterOutlet, IonToast} from '@ionic/vue';
import {storeToRefs} from "pinia";
import {useAppStore} from "@/states/app.state";

const {toastMessage, toastOptions, isToastOpen} = storeToRefs(useAppStore())
</script>


