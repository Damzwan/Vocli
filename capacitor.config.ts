import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.vocli.app',
    appName: 'Vocli',
    webDir: 'dist',
    plugins: {
        Keyboard: {
            resizeOnFullScreen: false
        },
        EdgeToEdge: {
            backgroundColor: "#000000",
        },
        FirebaseAuthentication: {
            skipNativeAuth: false,
            providers: ['google.com']
        },
        LocalNotifications: {
            smallIcon: "ic_stat_icon_config_sample",
            iconColor: "#488AFF",
            sound: "beep.wav",
        },
        SplashScreen: {
            launchAutoHide: false
        }
    }
};

export default config;
