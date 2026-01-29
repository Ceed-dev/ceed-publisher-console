'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUserSettings } from '@/contexts/user-settings-context';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useUserSettings();

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
        title="Settings"
        description="Manage your personal preferences"
      />
      <main className="p-6">
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Language</CardTitle>
              <CardDescription>
                Set the default language for new apps you create
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
                  <span className="font-medium">English</span>
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
                  <span className="font-medium">Japanese</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
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
