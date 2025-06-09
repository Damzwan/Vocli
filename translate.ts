// src/scripts/translate.ts
import fs from 'fs';
import path from 'path';
import * as deepl from 'deepl-node';
import {TargetLanguageCode} from "deepl-node/dist/types";
import {fileURLToPath} from 'url';  // <-- add this

const DEEPL_AUTH_KEY = process.env.DEEPL_KEY
const deeplClient = new deepl.DeepLClient(DEEPL_AUTH_KEY);

interface TargetLanguage {
    code: string;
    deeplCode: TargetLanguageCode;
}

const targetLanguages: TargetLanguage[] = [
    {code: 'de', deeplCode: 'de'},
    {code: 'en', deeplCode: 'en-GB'},
    {code: 'es', deeplCode: 'es'},
    {code: 'fr', deeplCode: 'fr'},
    {code: 'gr', deeplCode: 'el'},
    {code: 'it', deeplCode: 'it'},
    {code: 'nl', deeplCode: 'nl'},
    {code: 'pl', deeplCode: 'pl'},
    {code: 'pt', deeplCode: 'pt-PT'},
    {code: 'ro', deeplCode: 'ro'},
    {code: 'sv', deeplCode: 'sv'},
    {code: 'tr', deeplCode: 'tr'},
    {code: 'ru', deeplCode: 'ru'},
    {code: 'cz', deeplCode: 'cs'},
    {code: 'hu', deeplCode: 'hu'},
    // add more languages if needed
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesDir = path.resolve(__dirname, 'src/locales');

const sourceLangFile = path.join(localesDir, 'en.json');

type JsonObject = { [key: string]: string | JsonObject };

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function translateObject(obj: JsonObject, targetLangCode: TargetLanguage): Promise<JsonObject> {
    const result: JsonObject = {};

    for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'object') {
            result[key] = await translateObject(value as JsonObject, targetLangCode);
        } else {
            try {
                console.log(`[${targetLangCode}] Translating: "${value}"`);
                const res = await deeplClient.translateText(value, null, targetLangCode.deeplCode);
                console.log(`[${targetLangCode}] → "${res.text}"`);
                result[key] = res.text;
                await sleep(200); // avoid rate limit
            } catch (err) {
                console.error(`Error translating key "${key}":`, err);
                result[key] = value; // fallback to original text
            }
        }
    }
    return result;
}

function collectMissing(
    source: JsonObject,
    target: JsonObject,
    missing: Record<string, string>,
    prefix = ''
) {
    for (const key in source) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const sourceValue = source[key];
        const targetValue = target[key];

        if (typeof sourceValue === 'object') {
            if (!targetValue || typeof targetValue !== 'object') {
                target[key] = {};
            }
            collectMissing(sourceValue as JsonObject, target[key] as JsonObject, missing, fullKey);
        } else {
            if (!(key in target)) {
                missing[fullKey] = sourceValue as string;
            }
        }
    }
}

function buildNestedObject(flatObj: Record<string, string>): JsonObject {
    const nested: JsonObject = {};
    for (const fullKey in flatObj) {
        const parts = fullKey.split('.');
        let current = nested;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]] as JsonObject;
        }
        current[parts[parts.length - 1]] = flatObj[fullKey];
    }
    return nested;
}

function mergeObjects(target: JsonObject, source: JsonObject) {
    for (const key in source) {
        if (typeof source[key] === 'object') {
            if (!target[key]) target[key] = {};
            mergeObjects(target[key] as JsonObject, source[key] as JsonObject);
        } else {
            target[key] = source[key];
        }
    }
}

async function run() {
    // Read English source file
    const sourceTexts: JsonObject = JSON.parse(fs.readFileSync(sourceLangFile, 'utf8'));

    for (const lang of targetLanguages) {
        const targetFile = path.join(localesDir, `${lang.code}.json`);

        let targetTexts: JsonObject = {};
        if (fs.existsSync(targetFile)) {
            targetTexts = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
        }

        const missingKeys: Record<string, string> = {};
        collectMissing(sourceTexts, targetTexts, missingKeys);

        if (Object.keys(missingKeys).length === 0) {
            console.log(`No missing keys for ${lang.code}.`);
            continue;
        }

        console.log(`Translating missing keys for ${lang.code}...`);
        const nestedMissing = buildNestedObject(missingKeys);
        const translated = await translateObject(nestedMissing, lang);

        mergeObjects(targetTexts, translated);

        fs.writeFileSync(targetFile, JSON.stringify(targetTexts, null, 2), 'utf8');
        console.log(`✅ Updated ${lang.code}.json`);
    }
}

run().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
