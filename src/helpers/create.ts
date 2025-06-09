import {WordItem} from "@/types";
import {sanitize} from "@/helpers/exercises";

export function areWordsEqual(w1: WordItem, w2: WordItem): boolean {
    return sanitize(w1.from) === sanitize(w2.from) || sanitize(w1.to) === sanitize(w2.to)
}