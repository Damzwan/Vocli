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
    skipped?: number
    hint?: number
}

export type PracticeMethodName = "translation" | "multiple-choice" | "list" | "flashcards"

export enum PracticeOrder {
    knownToLearn,
    learnToKnown
}

export enum WordSelectionStrategy {
    handPicked,
    random
}

export type PracticeMode = {
    id: PracticeMethodName
    description: string
    link: string
    icon: string
}

export enum VocabImportMode {
    subject = 'subject',
    raw = 'raw'
}

export type ImportMethod = {
    title: string
    subtitle: string
    icon: string
    color: string
    id: VocabImportMode
}

export type User = {
    uid: string;
    creationDate: string;
    learnLanguage: LANGUAGE;
    knownLanguage: LANGUAGE;
    locale: LANGUAGE;
}

export type WordAlternativeResponse = {
    primary: string
    alternatives: string[]
}

export type WordPackNotificationItem = {
    time: string
    startDate: string
    endDate: string
}
