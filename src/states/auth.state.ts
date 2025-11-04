import {defineStore} from 'pinia';
import {ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {AuthStateChange, FirebaseAuthentication, SignInResult,} from '@capacitor-firebase/authentication';
import {FirebaseFirestore} from '@capacitor-firebase/firestore';
import {useAppStore} from '@/states/app.state';
import {User, WordPack} from '@/types';
import {loadLocalWordPacks, syncWordPacks} from '@/helpers/auth.helper';
import {LANGUAGE} from "@/config/languages.config";
import {useI18n} from "vue-i18n";
import {Preferences} from "@capacitor/preferences";

export const useAuthStore = defineStore('auth', () => {
    const authUser = ref<any | null>(null);
    const user = ref<User | null>(null);
    const wordPacks = ref<WordPack[]>([]);
    const wordPacksLoading = ref(true);
    const wordPacksOnlineLoading = ref(true);
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
                        router.replace('/home').then(() => {
                            setTimeout(() => {
                                authLoading.value = false;
                            }, 200);
                        });
                    } else {
                        authLoading.value = false;
                    }

                    authUser.value = firebaseUser;
                    void loadLocalWordPacks()

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
                    router.replace('/login');
                }
            }
        );
    };

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

    const loginMail = async () => {
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

    const loginAnonymously = async () => {
        try {
            const result: SignInResult = await FirebaseAuthentication.signInAnonymously();
            authUser.value = result.user;
        } catch (error) {
            console.error('Anonymous login failed:', error);
            appStore.showToast('Anonymous login failed.');
        }
    };

    const logout = async () => {
        try {
            // Sign out the user
            await FirebaseAuthentication.signOut();

            // Remove all keys except 'locale' in parallel
            const {keys} = await Preferences.keys();
            await Promise.all(
                keys
                    .filter(key => key !== 'locale')
                    .map(key => Preferences.remove({key}))
            );

            resetLocalState()
        } catch (error) {
            console.error('Logout failed:', error);
            appStore.showToast('Logout failed. Please try again.');
        }
    };


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
            console.log("Updating learnLanguage and knownLanguage in Firestore:", learnLanguage, knownLanguage);
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

    function resetLocalState() {
        authUser.value = null;
        user.value = null;
        wordPacks.value = [];
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
        changeLearnAndKnownLanguage,
        wordPacksOnlineLoading,
        loginMail
    };
});
