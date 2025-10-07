import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ko from './locales/ko.json';
import en from './locales/en.json';
import es from './locales/es.json';

const LANGUAGE_KEY = '@app_language';

// 사용자가 선택한 언어 가져오기
const getStoredLanguage = async () => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch (error) {
    console.error('Error getting stored language:', error);
    return null;
  }
};

// 언어 저장
export const setStoredLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Error storing language:', error);
  }
};

// 초기 언어 결정: 저장된 언어 > 디바이스 언어 > 한국어
const getInitialLanguage = async () => {
  const storedLanguage = await getStoredLanguage();
  if (storedLanguage) {
    return storedLanguage;
  }

  // 디바이스 언어 확인
  const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'ko';

  // 지원하는 언어 목록
  const supportedLanguages = ['ko', 'en', 'es'];

  return supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'ko';
};

// i18n 초기화
export const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        ko: { translation: ko },
        en: { translation: en },
        es: { translation: es },
      },
      lng: initialLanguage,
      fallbackLng: 'ko',
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: 'v3',
    });

  return i18n;
};

// 언어 변경 헬퍼 함수
export const changeLanguage = async (language: string) => {
  await i18n.changeLanguage(language);
  await setStoredLanguage(language);
};

export default i18n;
