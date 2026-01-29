export type Locale = 'en' | 'ja';

export const locales: Locale[] = ['en', 'ja'];
export const defaultLocale: Locale = 'en';

// Map from user settings language to locale
export function mapLanguageToLocale(language: 'eng' | 'jpn'): Locale {
  return language === 'jpn' ? 'ja' : 'en';
}
