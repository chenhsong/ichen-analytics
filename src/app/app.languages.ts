import { Config } from "./config";

import * as i18nJson from "../lib/i18n.json";

// Constants

let defaultLang = "en";
const langKey = "lang";

// Read language from local storage

if (localStorage) {
	const lang = localStorage.getItem(langKey);
	if (!!lang) defaultLang = lang;
}

// Utility functions

const i18n: { [lang: string]: ITranslationDictionary; } = i18nJson as any;

export function switchLanguage(lang: string)
{
	if (!(lang in i18n)) lang = defaultLang;

	Config.lang = lang;
	Config.i18n = i18n[lang];

	// Store in local storage
	if (localStorage) localStorage.setItem(langKey, lang);

	console.log(`Language switched to [${lang}]`);
}

switchLanguage(defaultLang);
