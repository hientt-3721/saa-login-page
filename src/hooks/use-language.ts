'use client';

import { useState, useEffect, useCallback } from 'react';

type Locale = 'vi' | 'en';
const STORAGE_KEY = 'NEXT_LOCALE';
const DEFAULT_LOCALE: Locale = 'vi';
const VALID_LOCALES: Locale[] = ['vi', 'en'];

function readLocaleFromStorage(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_LOCALES.includes(stored as Locale)) {
      return stored as Locale;
    }
  } catch {
    // localStorage unavailable (SSR or privacy mode)
  }
  return DEFAULT_LOCALE;
}

export function useLanguage() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(readLocaleFromStorage());
  }, []);

  const setLanguage = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // ignore write errors
    }
    document.cookie = `${STORAGE_KEY}=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
  }, []);

  return { locale, setLanguage };
}
