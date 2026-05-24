import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { type SupportedLanguage } from '../i18n';
import { STORAGE_KEYS } from '../data/types';

export function useLanguage() {
  const [language, setLanguage] = useState<SupportedLanguage>(
    i18n.language as SupportedLanguage
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.appLanguage).then((stored) => {
      if (stored === 'en' || stored === 'de') {
        i18n.changeLanguage(stored);
        setLanguage(stored);
      }
    });
  }, []);

  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.appLanguage, lang);
    setLanguage(lang);
  }, []);

  return { language, changeLanguage };
}
