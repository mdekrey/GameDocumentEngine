import i18nextBase from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';

export const i18n = i18nextBase.use(initReactI18next);
void i18n.init({
	resources: {
		en,
	},
	lng: 'en', // if you're using a language detector, do not define the lng option
	fallbackLng: 'en',

	interpolation: {
		escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
	},
});
