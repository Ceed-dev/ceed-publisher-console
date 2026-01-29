import { SupportedLanguage } from './app';

export interface UserSettings {
  defaultLanguage: SupportedLanguage;
  theme: 'light' | 'dark' | 'system';
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultLanguage: 'eng',
  theme: 'system',
};
