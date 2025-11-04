<template>
  <ion-page class="max-w-[1000px] mx-auto">
    <ion-content>
      <div v-if="isLoading" class="flex justify-center items-center h-full">
        <ion-spinner color="primary" class="w-[56px] h-[56px]"/>
      </div>

      <ion-router-outlet class="inner-router"  v-else/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {storeToRefs} from 'pinia';
import {useAuthStore} from '@/states/auth.state';
import {useVocabularyPracticeStore} from '@/states/vocabulary-practice.state';
import {IonSpinner, IonPage, IonContent, IonRouterOutlet} from '@ionic/vue';

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const {wordPacks, wordPacksLoading, wordPacksOnlineLoading} = storeToRefs(authStore);

const vocabStore = useVocabularyPracticeStore();
const {wordPack} = storeToRefs(vocabStore);

const isLoading = ref(false);

watchEffect(() => {
  if (wordPack.value) return;
  isLoading.value = true;
  const wordPackId = route.params.wordPackId as string | undefined;
  if (!wordPackId) {
    router.replace("/");
    return;
  }

  // Still loading local or online packs
  if (wordPacksLoading.value || wordPacksOnlineLoading.value) {
    return;
  }

  const foundPack = wordPacks.value.find(pack => pack.id === wordPackId);

  if (!foundPack) {
    // Online loading finished but pack not found → redirect
    router.replace("/");
    return;
  }

  // Set the store and finish loading
  wordPack.value = foundPack;
  isLoading.value = false;
});
</script>
