<template>
  <ion-modal class="z-[2000]" :is-open="feedbackModalOpen" @didDismiss="feedbackModalOpen = false">
    <div class="bg-background p-4">
      <ion-button fill="clear" class="absolute right-0 top-0" @click="modalController.dismiss()">
        <ion-icon slot="icon-only" class="fill-black" :icon="closeOutline"/>
      </ion-button>
      <p class="text-xl cabin-sketch-regular">{{ t(`${tPrefix}.title`) }}</p>
      <p class="text-md cabin-sketch-regular">{{ t(`${tPrefix}.subtitle`) }}</p>

      <div class="py-2"/>
      <ion-textarea
          v-model="likeText"
          :helper-text="t(`${tPrefix}.like_helper`)"
          fill="outline"
          :placeholder="t(`${tPrefix}.like_placeholder`)"
          color="secondary"
      />

      <ion-textarea
          class="py-2"
          v-model="dislikeText"
          :helper-text="t(`${tPrefix}.dislike_helper`)"
          fill="outline"
          :placeholder="t(`${tPrefix}.dislike_placeholder`)"
          color="secondary"

      />

      <p class="cabin-sketch-regular pt-4">{{ t(`${tPrefix}.you_like`) }}</p>
      <ion-radio-group v-model="score" mode="md">
        <ion-radio :value="FeedbackOptions.like" color="secondary">{{ t(`${tPrefix}.i_like`) }}</ion-radio>
        <br/>
        <ion-radio :value="FeedbackOptions.neutral" color="secondary">{{ t(`${tPrefix}.no_opinion`) }}</ion-radio>
        <br/>
        <ion-radio :value="FeedbackOptions.dislike" color="secondary">{{ t(`${tPrefix}.not_like`) }}</ion-radio>
        <br/>
      </ion-radio-group>


      <div class="flex justify-end">
        <ion-button color="secondary" @click="submit">{{ t(`${tPrefix}.submit`) }}</ion-button>
      </div>


    </div>
  </ion-modal>
</template>


<script setup lang="ts">
import {closeOutline} from "ionicons/icons";
import {ref} from 'vue'
import {IonButton, IonIcon, IonModal, IonRadio, IonRadioGroup, IonTextarea, modalController} from '@ionic/vue'
import {useAppStore} from "@/states/app.state";
import {useI18n} from "vue-i18n";
import {FirebaseFirestore} from '@capacitor-firebase/firestore';
import {storeToRefs} from "pinia";

const {t} = useI18n()
const tPrefix = "feedback"
const {feedbackModalOpen} = storeToRefs(useAppStore())

enum FeedbackOptions {
  like = 'like',
  neutral = 'neutral',
  dislike = 'dislike',
  empty = 'empty',
}

const likeText = ref('')
const dislikeText = ref('')
const score = ref<FeedbackOptions>(FeedbackOptions.empty)

async function submit() {
  const {showToast} = useAppStore()

  if (likeText.value === '' && dislikeText.value === '' && score.value === FeedbackOptions.empty) {
    showToast(t('toast.fill_one_field'), {color: 'warning'})
    return
  }

  try {
    await FirebaseFirestore.addDocument({
      reference: 'feedback', // root collection
      data: {
        likeText: likeText.value,
        dislikeText: dislikeText.value,
        score: score.value,
        timestamp: new Date().toISOString(), // plain string timestamp
      },
    });

    showToast(t('toast.thank_feedback'), {color: 'success'})
    modalController.dismiss()
    resetForm()
  } catch (e) {
    console.error('Error adding feedback: ', e)
    showToast(t('toast.error_feedback'), {color: 'danger'})
    modalController.dismiss()
  }
}

function resetForm() {
  dislikeText.value = ''
  likeText.value = ''
  score.value = FeedbackOptions.empty
}
</script>


<style scoped>

ion-modal {
  --width: fit-content;
  --min-width: 250px;
  --max-width: 80%;
  --height: fit-content;
  --border-radius: 6px;
  --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
  --backdrop-opacity: 0.4 !important;
}

</style>