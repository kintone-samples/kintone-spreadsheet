import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '~/src/js/locales/en/translation.json';
import jaTranslation from '~/src/js/locales/ja/translation.json';
import zhTranslation from '~/src/js/locales/zh/translation.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  ja: {
    translation: jaTranslation,
  },
  zh: {
    translation: zhTranslation,
  },
};

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: true,

  interpolation: {
    escapeValue: false,
  },
  resources: resources,
});

export default i18n;
