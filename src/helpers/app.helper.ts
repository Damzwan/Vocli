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