import {Preferences} from "@capacitor/preferences";
import {FirebaseFirestore} from "@capacitor-firebase/firestore";
import {storeToRefs} from "pinia";
import {useAuthStore} from "@/states/auth.state";
import type {WordPack} from "@/types";

export async function syncWordPacks(userId: string): Promise<void> {
    const authStore = useAuthStore();
    const {wordPacks, wordPacksLoading} = storeToRefs(authStore);

    // 1️⃣ Load local packs
    const preferenceKeys = await Preferences.keys();
    const localWordPacks: Record<string, WordPack> = {};

    for (const key of preferenceKeys.keys.filter(k => k.startsWith("pack-"))) {
        const packString = await Preferences.get({key});
        if (packString.value) {
            const parsed = JSON.parse(packString.value) as WordPack;
            localWordPacks[parsed.id] = parsed;
        }
    }

    // Set local packs immediately for fast UI
    wordPacks.value = Object.values(localWordPacks);
    wordPacksLoading.value = false;

    // 2️⃣ Fetch metadata (id + lastEdited) from Firestore
    let metaResult;
    try {
        metaResult = await FirebaseFirestore.getCollection({
            reference: `wordPacks/${userId}/metadata`,
        });
    } catch (error) {
        console.error("Failed to fetch metadata:", error);
        return; // stop here if offline
    }

    const outdatedIds: string[] = [];
    const onlineIds = new Set<string>();

    for (const snap of metaResult.snapshots || []) {
        const {lastEdited} = snap.data as { lastEdited: string };
        const id = snap.id;
        onlineIds.add(id);

        const localPack = localWordPacks[id];
        if (!localPack || new Date(lastEdited) > new Date(localPack.lastEdited)) {
            outdatedIds.push(id);
        }
    }

    // 3️⃣ Fetch full packs that are outdated (in parallel)
    await Promise.all(outdatedIds.map(async (id) => {
        try {
            const packSnap = await FirebaseFirestore.getDocument({
                reference: `wordPacks/${userId}/packs/${id}`,
            });
            const data = packSnap.snapshot?.data as WordPack | undefined;
            if (!data) return;

            // Update local storage
            await Preferences.set({key: `pack-${id}`, value: JSON.stringify(data)});

            // Merge into store incrementally
            const index = wordPacks.value.findIndex(p => p.id === id);
            if (index === -1) wordPacks.value.push(data);
            else wordPacks.value[index] = data;
        } catch (error) {
            console.error(`Failed to fetch word pack ${id}:`, error);
        }
    }));

    // 4️⃣ Remove missing packs locally
    for (const [id] of Object.entries(localWordPacks)) {
        if (!onlineIds.has(id)) {
            await Preferences.remove({key: `pack-${id}`});
            const index = wordPacks.value.findIndex(p => p.id === id);
            if (index !== -1) wordPacks.value.splice(index, 1);
        }
    }
}
