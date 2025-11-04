import {defineStore} from "pinia";
import {ref, reactive} from "vue";
import {
    LocalNotifications,
    LocalNotificationSchema,
} from "@capacitor/local-notifications";
import {Preferences} from "@capacitor/preferences";
import {WordPack, WordPackNotificationItem} from "@/types";

export const useNotificationStore = defineStore("notifications", () => {
    const isAllowed = ref(false);
    const wordPackToNotificationMap = ref<Record<string, WordPackNotificationItem[]>>({});

    LocalNotifications.checkPermissions().then(status => {
        isAllowed.value = status.display === "granted";
        if (isAllowed.value) {
            void initialize();
        }
    });


    async function askPermission() {
        const status = await LocalNotifications.requestPermissions();
        isAllowed.value = status.display === "granted";
        return isAllowed.value;
    }

    async function initialize() {
        if (!isAllowed.value) return;

        const {keys} = await Preferences.keys();
        const now = new Date();

        for (const key of keys) {
            if (key.startsWith("notifications-pack-")) {
                const res = await Preferences.get({key});
                const wordPackId = key.replace("notifications-pack-", "");
                const items: WordPackNotificationItem[] = res.value ? JSON.parse(res.value) : [];

                // 🧹 Remove expired notifications
                const validItems = items.filter(item => new Date(item.endDate) > now);

                if (validItems.length > 0) {
                    wordPackToNotificationMap.value[wordPackId] = validItems;
                    await Preferences.set({
                        key,
                        value: JSON.stringify(validItems),
                    });
                } else {
                    delete wordPackToNotificationMap.value[wordPackId];
                    await Preferences.remove({key});
                }
            }
        }
    }


    async function fetchNotificationInfoForWordPack(wordPackId: string): Promise<WordPackNotificationItem[]> {
        if (wordPackToNotificationMap.value[wordPackId]) {
            return wordPackToNotificationMap.value[wordPackId];
        }

        const res = await Preferences.get({key: `notifications-pack-${wordPackId}`});
        const data: WordPackNotificationItem[] = res.value ? JSON.parse(res.value) : [];

        const now = new Date();
        const validItems = data.filter(item => new Date(item.endDate) > now);

        wordPackToNotificationMap.value[wordPackId] = validItems;
        await Preferences.set({
            key: `notifications-pack-${wordPackId}`,
            value: JSON.stringify(validItems),
        });

        return validItems;
    }

    // --- Sync notifications for a given WordPack ---
    async function syncNotificationsForWordPack(wordPack: WordPack, data: WordPackNotificationItem[]) {
        if (!isAllowed.value) return;

        // 1️⃣ Remove all existing notifications for this WordPack
        const {notifications: scheduled} = await LocalNotifications.getPending();
        const packNotifications = scheduled.filter(n => n.extra?.wordPackId === wordPack.id);
        if (packNotifications.length > 0) {
            await LocalNotifications.cancel({notifications: packNotifications});
        }

        // 2️⃣ Filter out expired notification items
        const now = new Date();
        const activeItems = data.filter(item => new Date(item.endDate) > now);


        // 3️⃣ Prepare new notifications
        const newNotifications: LocalNotificationSchema[] = [];

        for (const [index, item] of activeItems.entries()) {
            const [hour, minute] = item.time.split(":").map(n => parseInt(n, 10));
            const start = new Date(item.startDate);
            start.setHours(hour, minute, 0, 0);

            const end = new Date(item.endDate);

            let current = new Date(start);
            if (current <= now) {
                current.setDate(now.getDate() + 1);
                current.setHours(hour, minute, 0, 0);
            }

            while (current <= end) {
                newNotifications.push({
                    id:
                        parseInt(`${wordPack.id.slice(0, 4)}${index}${current.getDate()}`.replace(/\D/g, "")) ||
                        Math.floor(Math.random() * 100000),
                    title: `Time to practice "${wordPack.name}"!`,
                    body: "Review your words today 💡",
                    schedule: {at: new Date(current)},
                    extra: {
                        wordPackId: wordPack.id,
                        startDate: item.startDate,
                        endDate: item.endDate,
                    },
                });

                current.setDate(current.getDate() + 1);
            }
        }

        if (newNotifications.length > 0) {
            await LocalNotifications.schedule({notifications: newNotifications});
        }

        wordPackToNotificationMap.value[wordPack.id] = activeItems;
        await Preferences.set({
            key: `notifications-pack-${wordPack.id}`,
            value: JSON.stringify(activeItems),
        });


    }

    return {
        isAllowed,
        wordPackToNotificationMap,
        askPermission,
        fetchNotificationInfoForWordPack,
        syncNotificationsForWordPack,
    };
});
