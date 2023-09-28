import type { ReadCallback } from 'i18next';
import i18nextBase from 'i18next';
import { initReactI18next } from 'react-i18next';
import MultiloadAdapter, {
	type MultiloadBackendOptions,
} from 'i18next-multiload-backend-adapter';
import HttpApi, { type HttpBackendOptions } from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { constructUrl as toLocalizationUrl } from '@/api/operations/getTranslationData';
// import en from './en.json';

class MyAdapter extends MultiloadAdapter {
	read(language: string, namespace: string, callback: ReadCallback) {
		console.log({ language, namespace, callback });
		super.read(language, namespace, callback);
	}
}

export const i18n = i18nextBase
	.use(MyAdapter)
	.use(LanguageDetector)
	.use(initReactI18next);
void i18n.init({
	// resources: {},
	// lng: 'en', // if you're using a language detector, do not define the lng option
	fallbackLng: 'en',

	missingKeyHandler(languages, namespace, key, fallbackValue) {
		console.warn('missing translation', {
			languages,
			namespace,
			key,
			fallbackValue,
		});
	},

	backend: {
		backend: HttpApi,
		backendOption: {
			loadPath: (languages, namespaces) =>
				toLocalizationUrl({
					lng: languages.join(' '),
					ns: namespaces.join(' '),
				}),
		} satisfies HttpBackendOptions,
	} satisfies MultiloadBackendOptions,

	interpolation: {
		escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
	},
});
