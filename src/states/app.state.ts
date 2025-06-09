import {defineStore} from "pinia";
import {ref} from "vue";
import {LANGUAGE} from "@/config/languages.config";

type ToastOptions = {
    duration?: number;
    color?: "primary" | "success" | "info" | "warning" | "danger";
}

const baseToastOptions: ToastOptions = {
    duration: 5000,
    color: 'primary',
}
export const useAppStore = defineStore('app', () => {
    const isToastOpen = ref(false);
    const toastMessage = ref('')
    const toastOptions = ref<ToastOptions>(baseToastOptions);
    const learnLanguage = ref<LANGUAGE>(LANGUAGE.it);
    const knownLanguage = ref<LANGUAGE>(LANGUAGE.en);

    function showToast(message: string, options?: ToastOptions) {
        isToastOpen.value = true;
        toastMessage.value = message;
        toastOptions.value = {...baseToastOptions, ...options};
    }

    return {showToast, isToastOpen, toastMessage, toastOptions, learnLanguage, knownLanguage};
})