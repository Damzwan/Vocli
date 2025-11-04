import {defineStore} from "pinia";
import {ref} from "vue";
import {CapacitorShake} from '@capgo/capacitor-shake';

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
    const feedbackModalOpen = ref(false);


    function showToast(message: string, options?: ToastOptions) {
        isToastOpen.value = true;
        toastMessage.value = message;
        toastOptions.value = {...baseToastOptions, ...options};
    }

    function initShake() {
        CapacitorShake.addListener('shake', () => {
            feedbackModalOpen.value = true;
        });
    }

    return {showToast, isToastOpen, toastMessage, toastOptions, feedbackModalOpen, initShake};
})