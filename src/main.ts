import {createApp} from 'vue'
import App from './App.vue'
import router from './router';

import {IonicVue, iosTransitionAnimation, mdTransitionAnimation} from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */
/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import './theme/theme.css';
import './theme/tailwind.css';
import {createPinia} from "pinia";

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {initFirebase} from "@/helpers/firebase";
import {createI18n} from 'vue-i18n'

import de from './locales/de.json'
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import gr from './locales/gr.json'
import it from './locales/it.json'
import nl from './locales/nl.json'
import pl from './locales/pl.json'
import pt from './locales/pt.json'
import ro from './locales/ro.json'
import sv from './locales/sv.json'
import tr from './locales/tr.json'
import cz from './locales/cz.json'
import ru from './locales/ru.json'
import hu from './locales/hu.json'
import {getInitLanguage, isNative} from "@/helpers/app.helper";
import {LocalNotifications} from "@capacitor/local-notifications";

dayjs.extend(duration);

const pinia = createPinia()
initFirebase()

const i18n = createI18n({
    globalInjection: true,
    locale: "en",
    fallbackLocale: 'en',
    messages: {
        de, en, es, fr, gr, it, nl, pl, pt, ro, sv, tr, cz, ru, hu
    },
})
getInitLanguage().then((locale) => {
    i18n.global.locale = locale as any;
})

// TODO move this somewhere! better!
LocalNotifications.addListener("localNotificationActionPerformed", (notification) => {
    void router.push(`/practice/${notification.notification.extra.wordPackId}`)
})


const app = createApp(App)
    .use(IonicVue, {navAnimation: isNative() ? iosTransitionAnimation : mdTransitionAnimation}).use(i18n)
    .use(router).use(pinia)

router.isReady().then(() => {
    app.mount('#app');
});
