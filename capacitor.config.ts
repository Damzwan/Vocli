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
    }
};

export default config;
