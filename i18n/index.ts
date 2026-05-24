import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from '../locales/en.json';
import de from '../locales/de.json';

const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'de';
const defaultLang = deviceLocale.startsWith('de') ? 'de' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
  },
  lng: defaultLang,
  fallbackLng: 'de',
  interpolation: { escapeValue: false },
});

export default i18n;
export type SupportedLanguage = 'en' | 'de';
