import {PracticeMode} from "@/types";
import {imagesOutline, keypadOutline, listOutline, textOutline} from "ionicons/icons";

export const MIN_PRACTICE_WORDS = 5;
export const AVG_PRACTICE_WORDS = 10;
export const PRACTICE_MODES: PracticeMode[] = [
    {
        id: "translation",
        link: "translation",
        icon: textOutline,
        description: "Translate words."
    },
    {
        id: "multiple-choice",
        link: "multiple-choice",
        icon: keypadOutline,
        description: "Pick the right option."
    },
    {
        id: "list",
        link: "list",
        icon: listOutline,
        description: "Browse word list."
    },
    {
        id: "flashcards",
        link: "flashcard",
        icon: imagesOutline,
        description: "Flip to learn."
    }
]
