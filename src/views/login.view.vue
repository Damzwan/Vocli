<template>
  <ion-page class="max-w-[1000px] mx-auto flex flex-col items-center justify-center p-4">

    <div class="w-full h-full flex flex-col justify-center items-between">

      <h1 class="text-2xl font-bold mb-6">Login</h1>

      <div class="flex flex-col">
        <button
            @click="loginGoogle"
            class="w-full bg-blue-600 text-white py-3 rounded mb-4 hover:bg-blue-700 transition"
        >
          Continue with Google
        </button>

        <button
            @click="loginAnonymously"
            class="w-full bg-gray-600 text-white py-3 rounded hover:bg-gray-700 transition"
        >
          Continue Anonymously
        </button>
      </div>
    </div>


  </ion-page>
</template>

<script setup lang="ts">
import {IonPage} from "@ionic/vue";
import {useAuthStore} from "@/states/auth.state";

const authStore = useAuthStore();

const loginGoogle = async () => {
  try {
    await authStore.loginGoogle();
  } catch (error) {
    console.error(error);
  }
};

const loginAnonymously = async () => {
  try {
    await authStore.loginAnonymously();
  } catch (error) {
    console.error(error);
  }
};
</script>

<style scoped>

</style>
