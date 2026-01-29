'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUserSettings } from '@/contexts/user-settings-context';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useUserSettings();
  const t = useTranslations('settings');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Header
        title={t('title')}
        description={t('description')}
      />
      <main className="p-6">
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('defaultLanguage')}</CardTitle>
              <CardDescription>
                {t('defaultLanguageDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateSettings({ defaultLanguage: 'eng' })}
                  className={`
                    flex-1 rounded-lg border-2 p-4 text-center transition-all
                    ${settings.defaultLanguage === 'eng'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-muted bg-muted/30 text-muted-foreground opacity-50'
                    }
                  `}
                >
                  <span className="font-medium">{t('english')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ defaultLanguage: 'jpn' })}
                  className={`
                    flex-1 rounded-lg border-2 p-4 text-center transition-all
                    ${settings.defaultLanguage === 'jpn'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-muted bg-muted/30 text-muted-foreground opacity-50'
                    }
                  `}
                >
                  <span className="font-medium">{t('japanese')}</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('appearance')}</CardTitle>
              <CardDescription>
                {t('appearanceDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('theme')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('themeDesc')}
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
