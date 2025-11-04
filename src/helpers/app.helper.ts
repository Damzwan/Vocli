import {Capacitor} from "@capacitor/core";
import {Preferences} from "@capacitor/preferences";
import {useI18n} from "vue-i18n";
import {Device} from '@capacitor/device';
import {LANGUAGE} from "@/config/languages.config";

async function detectLocale() {
    // Try device language first (if running native)
    let locale = await Preferences.get({key: 'locale'})
    if (locale.value) return locale.value

    let newLocale;

    if (Capacitor.isNativePlatform()) {
        const info = await Device.getLanguageCode();
        newLocale = info.value || 'en';
    } else {
        const userLang = navigator.language || 'en';
        newLocale = userLang.split('-')[0];
    }
    return newLocale;
}

export async function getInitLanguage() {
    const detectedLocale = await detectLocale();
    const localeToSet = Object.keys(LANGUAGE).includes(detectedLocale) ? detectedLocale : "en"
    Preferences.set({key: 'locale', value: localeToSet});
    return localeToSet;
}

// helpers/app.helper.ts
export function debounce<T extends (...args: any[]) => Promise<any> | void>(
    func: T,
    wait: number
) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let pendingArgs: Parameters<T> | null = null;
    let isRunning = false;

    async function invoke(args: Parameters<T>) {
        isRunning = true;
        try {
            await func(...args);
        } finally {
            isRunning = false;
        }
    }

    const debounced = (...args: Parameters<T>) => {
        pendingArgs = args;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (pendingArgs) invoke(pendingArgs);
            pendingArgs = null;
            timeout = null;
        }, wait);
    };

    // ✅ Immediately run the pending call
    (debounced as any).flush = async (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        const finalArgs = args.length > 0 ? args : pendingArgs;
        if (finalArgs) {
            pendingArgs = null;
            await invoke(finalArgs);
        }
    };

    // 🚫 Cancel any pending execution
    (debounced as any).cancel = () => {
        if (timeout) clearTimeout(timeout);
        timeout = null;
        pendingArgs = null;
    };

    // 🧭 Expose states
    Object.defineProperties(debounced, {
        pending: {
            get: () => Boolean(timeout),
        },
        running: {
            get: () => isRunning,
        },
    });

    return debounced as T & {
        flush: (...args: Parameters<T>) => Promise<void>;
        cancel: () => void;
        readonly pending: boolean;
        readonly running: boolean;
    };
}


export function isNative() {
    return Capacitor.isNativePlatform();
}

