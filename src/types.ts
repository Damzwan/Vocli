import {LANGUAGE} from "@/config/languages.config";

export type WordPack = {
    id: string;
    name: string;
    lastEdited: string;
    lastPracticed?: string;
    learnLanguage: LANGUAGE;
    knownLanguage: LANGUAGE;
    words: WordItem[]
}

export type WordItem = {
    from: string
    to: string
}

export type WrongWordItem = WordItem & {
    mistakes?: string[]
    skipped?: boolean
    hint?: number
}

export type PracticeMethodName = "translation" | "multiple-choice" | "list" | "flashcards"

export enum PracticeOrder {
    knownToLearn,
    learnToKnown
}

export type PracticeMode = {
    id: PracticeMethodName
    description: string
    link: string
    icon: string
}

export enum VocabImportMode {
    generate = 'generate',
    raw = 'raw'
}

export type User = {
    uid: string;
    creationDate: string;
    learnLanguage: LANGUAGE;
    knownLanguage: LANGUAGE;
    locale: LANGUAGE;
}
