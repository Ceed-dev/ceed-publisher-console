import { FirebaseTimestamp } from './common';

export type Platform = 'web' | 'ios';
export type AppStatus = 'active' | 'suspended';
export type ContextLoggingMode = 'none' | 'truncated' | 'hashed' | 'full';
export type SupportedLanguage = 'eng' | 'jpn';

export interface AppSettings {
  cooldownSeconds: number;
  allowedOrigins: string[];
  supportedLanguages: SupportedLanguage[];
  contextLoggingMode: ContextLoggingMode;
}

export interface App {
  appId: string;
  orgId: string;
  appName: string;
  platforms: Platform[];
  status: AppStatus;
  settings: AppSettings;
  meta: {
    createdAt: FirebaseTimestamp;
    updatedAt: FirebaseTimestamp;
  };
}

export interface AppCreate {
  appName: string;
  platforms: Platform[];
}

export interface AppUpdate {
  appName?: string;
  platforms?: Platform[];
  status?: AppStatus;
  settings?: Partial<AppSettings>;
}
