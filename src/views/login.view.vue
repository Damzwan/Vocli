<template>
  <ion-page class="max-w-[1000px] mx-auto">
    <ion-content>
      <div class="w-full h-full flex flex-col justify-center items-center p-4">
        <div class="flex flex-col grow justify-center items-center w-full">
          <p class="text-5xl py-2">Vocli</p>
          <div>Test {{Capacitor.isNativePlatform()}} {{Capacitor.getPlatform()}} {{getExtendedPlatform()}}</div>
          <div class="grow w-full flex justify-center items-center">
            <swiper
                v-show="!showLoginScreen"
                class="w-full"
                :loop="true"
                :pagination="{ clickable: true }"
                :modules="[Pagination]"
                @click="goNext"
                ref="swiperRef"
            >
              <swiper-slide
                  v-for="(slide, index) in loginSlides"
                  :key="index"
                  class="flex flex-col justify-center items-center text-center w-full h-full cursor-pointer p-12"
              >
                <img
                    :src="slide.img"
                    alt=""
                    :class="{'w-32': smallDevice, 'w-64': !smallDevice}"
                    class="aspect-square mx-auto object-contain mb-6 rounded-lg"
                />
                <p class="text-3xl font-semibold mb-2" v-if="!showLoginScreen">{{ slide.title }}</p>
                <p class="text-lg font-semibold mb-1" v-else>{{ slide.title }}</p>
                <p class="text-base" v-if="!showLoginScreen">{{ slide.subtitle }}</p>
                <p class="text-base" v-else>{{ slide.subtitle }}</p>
              </swiper-slide>
            </swiper>
          </div>

          <Transition name="fade">
            <div v-if="showLoginScreen" class="w-full">
              <form v-if="!isPasswordForgotten" class="flex flex-col gap-3 mx-auto max-w-md"
                    @keyup.enter="onLoginClick">
                <div :class="{ error: v$.loginEmail.$errors.length }" class="flex flex-col">

                  <ion-input
                      color="secondary"
                      fill="outline"
                      v-model="state.loginEmail"
                      @ionBlur="v$.loginEmail.$validate()"
                      ref="mailInput"
                      type="email" placeholder="sketcher@gmail.com">
                    <ion-icon slot="start" :icon="mail" aria-hidden="true" size="large"
                              class="fill-gray-500"/>
                  </ion-input>
                  <div v-for="error of v$.loginEmail.$errors" :key="error.$uid">
                    <div class="text-sm text-red-600">{{ error.$message }}</div>
                  </div>
                </div>

                <div :class="{ error: v$.password.$errors.length }" class="flex flex-col">
                  <div>
                    <ion-input
                        v-model="state.password"
                        @ionBlur="v$.password.$validate()"
                        color="secondary"
                        placeholder="Password"
                        fill="outline"
                        type="password">
                      <ion-icon slot="start" :icon="lockClosedOutline" aria-hidden="true" size="large"
                                class="fill-gray-500"/>
                      <ion-input-password-toggle slot="end" color="secondary"/>
                    </ion-input>
                    <div v-for="error of v$.password.$errors" :key="error.$uid">
                      <div class="text-sm text-red-600">{{ error.$message }}</div>
                    </div>
                  </div>
                  <div class="w-full flex justify-between" v-if="!isRegistering && !isPasswordForgotten">
                    <ion-button shape="round" color="secondary" size="small" fill="clear" @click="isRegistering=true">
                      New
                      Account?
                    </ion-button>
                    <ion-button shape="round" color="secondary" size="small" fill="clear"
                                @click="isPasswordForgotten=true">
                      Forgot your password?
                    </ion-button>
                  </div>

                </div>

                <div :class="{ error: v$.confirmPassword.$errors.length }" class="flex flex-col" v-if="isRegistering">
                  <div>
                    <ion-input
                        v-model="state.confirmPassword"
                        @ionBlur="v$.confirmPassword.$validate()"
                        placeholder="Confirm Password"
                        color="secondary"
                        fill="outline"
                        type="password">
                      <ion-icon slot="start" :icon="lockClosedOutline" aria-hidden="true" size="large"
                                class="fill-gray-500"/>
                    </ion-input>
                    <div v-for="error of v$.confirmPassword.$errors" :key="error.$uid">
                      <div class="text-sm text-red-600">{{ error.$message }}</div>
                    </div>
                  </div>


                  <div class="w-full flex justify-start">
                    <ion-button shape="round" color="secondary" size="small" fill="clear"
                                @click="isRegistering=false">
                      Back
                      to sign in
                    </ion-button>
                  </div>
                </div>

                <div class="text-red-600 text-md">{{ loginErrorMsg }}</div>

              </form>

              <form v-else-if="isPasswordForgotten" @keyup.enter="onPasswordForget"
                    class="flex flex-col gap-3 mx-auto max-w-md">
                <div :class="{ error: v$.loginEmail.$errors.length }" class="flex flex-col">

                  <ion-input
                      color="secondary"
                      fill="outline"
                      v-model="state.loginEmail"
                      @ionBlur="v$.loginEmail.$validate()"
                      ref="mailInput"
                      type="email" placeholder="sketcher@gmail.com">
                    <ion-icon slot="start" :icon="mail" aria-hidden="true" size="large"
                              class="fill-gray-500"/>
                  </ion-input>
                  <div v-for="error of v$.loginEmail.$errors" :key="error.$uid">
                    <div class="text-sm text-red-600">{{ error.$message }}</div>
                  </div>
                  <div class="w-full flex justify-start">
                    <ion-button shape="round" color="secondary" size="small" fill="clear"
                                @click="isPasswordForgotten=false">Back
                      to sign in
                    </ion-button>
                  </div>
                </div>
              </form>
            </div>
          </Transition>
        </div>

        <div class="flex flex-col items-center justify-center gap-4">
          <ion-button shape="round" color="secondary" size="large" class="w-5/6 max-w-md" @click="showLoginScreen=true"
                      v-if="!showLoginScreen">
            <ion-icon slot="start" :icon="mail" class="mr-2"/>
            Sign in
          </ion-button>

          <ion-button shape="round" color="secondary" size="large" class="w-5/6 max-w-md" @click="loginMail"
                      v-else-if="showLoginScreen && !isPasswordForgotten">

            <ion-icon slot="end" :icon="sendOutline" v-if="!loginLoading" class="ml-2"/>
            <ion-spinner name="crescent" slot="end" class="ml-2 text-white" v-else/>
            {{ isRegistering ? 'Sign up' : 'Sign in' }}
          </ion-button>

          <ion-button shape="round" color="secondary" size="large" class="w-5/6 max-w-md" @click="onPasswordForget"
                      v-else-if="showLoginScreen && isPasswordForgotten">

            <ion-icon slot="end" class="ml-2" :icon="sendOutline" v-if="!loginLoading"/>
            <ion-spinner name="crescent" slot="end" class="ml-2 text-white" v-else/>

            Reset
          </ion-button>

          <ion-button shape="round" color="secondary" size="large" class="w-5/6 max-w-md" fill="outline"
                      @click="loginGoogle">
            <ion-icon slot="start" :icon="logoGoogle"/>
            <ion-spinner name="crescent" slot="end" class="ml-2 text-secondary" v-if="googleLoading"/>
            Continue With Google
          </ion-button>
          <ion-button shape="round" color="secondary" size="large" class="w-5/6 max-w-md" fill="clear"
                      @click="isAnonymousConfirmationOpen=true">Continue
            <ion-spinner name="crescent" slot="end" class="ml-2 text-secondary" v-if="anonymousLoading"/>
            As Anonymous
          </ion-button>
        </div>
      </div>
      <ion-alert
          :is-open="isAnonymousConfirmationOpen"
          @didDismiss="isAnonymousConfirmationOpen=false"
          header="Anonymous Login"
          message="You won't be able to access this account on other devices or after logout. You can upgrade later."
          :buttons="[
      { text: 'Cancel', role: 'cancel' },
      { text: 'Create anonymous account', handler: loginAnonymously }
    ]"
      />
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import {
  IonAlert,
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonPage,
  IonSpinner,
  onIonViewDidLeave
} from "@ionic/vue";
import {useAuthStore} from "@/states/auth.state";
import {lockClosedOutline, logoGoogle, mail, sendOutline} from "ionicons/icons";
import {computed, reactive, ref, watch} from "vue";
import {email, minLength, required, sameAs} from '@vuelidate/validators'
import {useVuelidate} from '@vuelidate/core'
import {FirebaseAuthentication} from "@capacitor-firebase/authentication";
import {Swiper, SwiperSlide} from 'swiper/vue';
import {Pagination} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';


import loginImg1 from "@/assets/login/vocli1.webp"
import loginImg2 from "@/assets/login/vocli2.webp"
import loginImg3 from "@/assets/login/vocli3.webp"
import {Capacitor} from "@capacitor/core";
import {getExtendedPlatform} from "@/helpers/app.helper";

const authStore = useAuthStore();
const isRegistering = ref(false);
const showLoginScreen = ref(false)

const loginLoading = ref(false)
const googleLoading = ref(false)
const anonymousLoading = ref(false)

const isPasswordForgotten = ref(false);
const forgotPassword = ref(false)
const forgotPasswordSent = ref(false)

const isAnonymousConfirmationOpen = ref(false)
const swiperRef = ref<any>(null)


const smallDevice = computed(() => window.innerHeight < 700)

const loginSlides = [
  {
    img: loginImg1,
    title: 'Create Packs',
    subtitle: 'Generate word lists instantly with AI'
  },
  {
    img: loginImg2,
    title: 'Practice Smart',
    subtitle: 'Study the way that fits you best'
  },
  {
    img: loginImg3,
    title: 'Set Reminders',
    subtitle: 'Stay consistent with study alerts'
  }
]


const state = reactive({
  loginEmail: '',
  password: '',
  confirmPassword: ''
})

const confirmRef = computed(() => state.password)

const rules = {
  loginEmail: {required, email},
  password: {required, minLength: minLength(8)},
  confirmPassword: {required, minLength: minLength(8), confirmRef: sameAs(confirmRef)}
}

const isLoginInValid = computed(() => v$.value.loginEmail.$invalid || v$.value.password.$invalid)
const isForgetPasswordInvalid = computed(() => v$.value.loginEmail.$invalid)
const isRegisterInvalid = computed(() => v$.value.loginEmail.$invalid || v$.value.password.$invalid || v$.value.confirmPassword.$invalid)

const v$ = useVuelidate(rules, state)


const loginErrorMsg = ref("")

// reset the error messages
watch([isRegistering, forgotPassword], () => {
  v$.value.$reset()
  loginErrorMsg.value = ''
})


function onLoginClick() {
  if (!showLoginScreen.value) {
    showLoginScreen.value = true
  } else loginMail()
}

async function loginMail() {
  await v$.value.$validate()

  if (isRegistering.value) {
    if (isRegisterInvalid.value) return
    try {
      loginLoading.value = true
      await FirebaseAuthentication.createUserWithEmailAndPassword({
        email: state.loginEmail,
        password: state.password
      })

    } catch (e: any) {
      console.log(e.code)
      if (e.code == 'auth/email-already-in-use') loginErrorMsg.value = 'Account already exists, try logging in instead.'
      else if (e.code == 'email-already-in-use') loginErrorMsg.value = 'Account already exists, try logging in instead.'
      else loginErrorMsg.value = 'Something went wrong, please try again later. If this issue persists contact me.'
      loginLoading.value = false
    }
  } else {
    if (isLoginInValid.value) return
    try {
      loginLoading.value = true
      await FirebaseAuthentication.signInWithEmailAndPassword({
        email: state.loginEmail,
        password: state.password
      })
    } catch (e: any) {
      if (e.code == 'auth/invalid-credential') loginErrorMsg.value = 'Account not found or wrong password.'
      else if (e.message.includes('INVALID_LOGIN_CREDENTIALS')) loginErrorMsg.value = 'Account not found or wrong password.' // TODO current hack since the plugin does not return the error code...
      else if (e.code == 'auth/too-many-requests') loginErrorMsg.value = 'Too many attempts, try again later.'
      else loginErrorMsg.value = 'Something went wrong, please try again later. If this issue persists contact me.'
      loginLoading.value = false
    }
  }
}

const loginGoogle = async () => {
  try {
    googleLoading.value = true
    await authStore.loginGoogle();
  } catch (error) {
    console.error(error);
  } finally {
    googleLoading.value = false
  }
};

const loginAnonymously = async () => {
  try {
    anonymousLoading.value = true
    await authStore.loginAnonymously();
  } catch (error) {
    console.error(error);
  } finally {
    anonymousLoading.value = false
  }
};

async function onPasswordForget() {
  try {
    await v$.value.$validate()
    if (isForgetPasswordInvalid.value) return
    loginLoading.value = true
    await FirebaseAuthentication.sendPasswordResetEmail({
      email: state.loginEmail
    })
    forgotPasswordSent.value = true
    loginLoading.value = false
  } catch (e: any) {
    loginErrorMsg.value = 'Email not found'
    loginLoading.value = false
    console.log(e.code)
  }
}

onIonViewDidLeave(() => {
  state.loginEmail = ''
  state.password = ''
  state.confirmPassword = ''
  isRegistering.value = false
  isPasswordForgotten.value = false
  forgotPassword.value = false
  forgotPasswordSent.value = false
  loginErrorMsg.value = ''
  showLoginScreen.value = false
  v$.value.$reset()
  loginErrorMsg.value = ''
})

function goNext() {
  if (!swiperRef.value) return;
  const swiper = swiperRef.value.$el.swiper;
  swiper.slideNext();
}


</script>

<style scoped>
.fade-enter-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
}

.fade-enter-to {
  opacity: 1;
}

</style>
