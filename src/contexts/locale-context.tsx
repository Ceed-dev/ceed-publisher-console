'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useUserSettings } from './user-settings-context';
import { Locale, mapLanguageToLocale } from '@/i18n';

import enMessages from '@/messages/en.json';
import jaMessages from '@/messages/ja.json';

const messages: Record<Locale, typeof enMessages> = {
  en: enMessages,
  ja: jaMessages,
};

interface LocaleContextValue {
  locale: Locale;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { settings, loading } = useUserSettings();

  const locale = useMemo(() => {
    return mapLanguageToLocale(settings.defaultLanguage);
  }, [settings.defaultLanguage]);

  const currentMessages = messages[locale];

  // Show loading state while user settings are loading
  if (loading) {
    return (
      <NextIntlClientProvider locale="en" messages={messages.en}>
        {children}
      </NextIntlClientProvider>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale }}>
      <NextIntlClientProvider locale={locale} messages={currentMessages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
