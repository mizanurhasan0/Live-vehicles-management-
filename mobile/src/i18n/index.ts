import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import bn from './bn.json';
import en from './en.json';

const deviceLang = Localization.getLocales()[0]?.languageCode;
const initial = deviceLang === 'en' ? 'en' : 'bn';

void i18n.use(initReactI18next).init({
  resources: { bn: { translation: bn }, en: { translation: en } },
  lng: initial,
  fallbackLng: 'bn',
  interpolation: { escapeValue: false },
});

export default i18n;

export function toggleLanguage() {
  const next = i18n.language === 'bn' ? 'en' : 'bn';
  void i18n.changeLanguage(next);
  return next;
}
