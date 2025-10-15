import {defineStore} from 'pinia';
import {ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {AuthStateChange, FirebaseAuthentication, SignInResult,} from '@capacitor-firebase/authentication';
import {FirebaseFirestore} from '@capacitor-firebase/firestore';
import {useAppStore} from '@/states/app.state';
import {User, WordPack} from '@/types';
import {syncWordPacks} from '@/helpers/auth.helper';
import {LANGUAGE} from "@/config/languages.config";
import {useI18n} from "vue-i18n";
import {Preferences} from "@capacitor/preferences";

export const useAuthStore = defineStore('auth', () => {
    const authUser = ref<any | null>(null);
    const user = ref<User | null>(null);
    const wordPacks = ref<WordPack[]>([]);
    const wordPacksLoading = ref(true);
    const authLoading = ref(true);

    const router = useRouter();
    const route = useRoute();
    const appStore = useAppStore();

    const {t, locale} = useI18n()

    // ✅ Initialize native auth listener
    const initAuthListener = async () => {
        await FirebaseAuthentication.addListener(
            'authStateChange',
            async (state: AuthStateChange) => {
                authLoading.value = true;
                const firebaseUser = state.user;

                if (firebaseUser) {
                    if (route.path === '/login') {
                        router.push('/home').then(() => {
                            setTimeout(() => {
                                authLoading.value = false;
                            }, 200);
                        });
                    } else {
                        authLoading.value = false;
                    }

                    authUser.value = firebaseUser;

                    // Fetch or create Firestore user
                    const fireUser = await getFireStoreUser(firebaseUser.uid);

                    if (fireUser) {
                        user.value = fireUser;
                        locale.value = fireUser.locale
                        void Preferences.set({key: "locale", value: locale.value})
                    } else {
                        await createFireStoreUser(firebaseUser);
                    }

                    await syncWordPacks(firebaseUser.uid);
                } else {
                    authUser.value = null;
                    user.value = null;
                    authLoading.value = false;
                    router.push('/login');
                }
            }
        );
    };

    // ✅ Google login
    const loginGoogle = async () => {
        try {
            const result: SignInResult = await FirebaseAuthentication.signInWithGoogle();
            if (result.user) {
                authUser.value = result.user;
            } else {
                throw new Error('Google sign-in returned no user.');
            }
        } catch (error) {
            console.error('Google login failed:', error);
            appStore.showToast('Google login failed.');
        }
    };

    // ✅ Anonymous login
    const loginAnonymously = async () => {
        try {
            const result: SignInResult = await FirebaseAuthentication.signInAnonymously();
            authUser.value = result.user;
        } catch (error) {
            console.error('Anonymous login failed:', error);
            appStore.showToast('Anonymous login failed.');
        }
    };

    // ✅ Logout
    const logout = async () => {
        try {
            await FirebaseAuthentication.signOut();
            authUser.value = null;
            user.value = null;
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            appStore.showToast('Logout failed.');
        }
    };

    // ✅ Fetch Firestore user (native)
    const getFireStoreUser = async (uid: string): Promise<User | null> => {
        try {
            const docSnap = await FirebaseFirestore.getDocument({
                reference: `users/${uid}`,
            });
            return docSnap.snapshot.data ? (docSnap.snapshot.data as User) : null;
        } catch (error) {
            console.error('Error fetching Firestore user:', error);
            return null;
        }
    };

    // ✅ Create Firestore user (native)
    const createFireStoreUser = async (authUser: any) => {
        try {
            const newUser: User = {
                uid: authUser.uid,
                creationDate: new Date().toISOString(),
                learnLanguage: LANGUAGE.it,
                knownLanguage: LANGUAGE.en,
                locale: LANGUAGE.en
            };
            await FirebaseFirestore.setDocument({
                reference: `users/${authUser.uid}`,
                data: newUser,
            });
            user.value = newUser;
        } catch (error) {
            console.error('Error creating Firestore user:', error);
        }
    };

    async function changeLocale(lang: LANGUAGE) {
        if (!user.value) return;
        locale.value = lang;
        user.value.locale = lang;
        void Preferences.set({key: "locale", value: lang});

        try {
            await FirebaseFirestore.updateDocument({
                reference: `users/${authUser.value.uid}`,
                data: {locale: lang},
            });
        } catch (error) {
            console.error("Failed to update locale in Firestore:", error);
        }
    }

    async function changeLearnAndKnownLanguage(learnLanguage: LANGUAGE, knownLanguage: LANGUAGE) {
        try {
            if (!user.value) return;
            user.value.learnLanguage = learnLanguage;
            user.value.knownLanguage = knownLanguage;
            await FirebaseFirestore.updateDocument({
                reference: `users/${authUser.value.uid}`,
                data: {learnLanguage, knownLanguage},
            });
        } catch (error) {
            console.error("Failed to update locale in Firestore:", error);
        }
    }

    return {
        authUser,
        user,
        wordPacks,
        wordPacksLoading,
        authLoading,
        initAuthListener,
        loginGoogle,
        loginAnonymously,
        logout,
        changeLocale,
        changeLearnAndKnownLanguage
    };
});
