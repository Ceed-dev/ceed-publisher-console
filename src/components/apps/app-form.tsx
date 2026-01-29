'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useOrganization } from '@/hooks/use-organization';
import { useUserSettings } from '@/contexts/user-settings-context';
import { Globe, Smartphone, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function AppForm() {
  const router = useRouter();
  const { currentOrg } = useOrganization();
  const { settings: userSettings } = useUserSettings();
  const [appName, setAppName] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('appForm');
  const tCommon = useTranslations('common');

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOrg) {
      setError(t('selectOrg'));
      return;
    }

    if (!appName.trim()) {
      setError(t('appNameRequired'));
      return;
    }

    if (platforms.length === 0) {
      setError(t('platformRequired'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dashboard/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrg.orgId,
          appName: appName.trim(),
          platforms,
          defaultLanguage: userSettings.defaultLanguage,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create app');
      }

      const { app } = await response.json();
      router.push(`/apps/${app.appId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="appName" className="text-sm font-medium">
              {t('appName')}
            </label>
            <Input
              id="appName"
              placeholder={t('appNamePlaceholder')}
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              error={error && !appName ? t('appNameRequired') : undefined}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('platforms')}</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => togglePlatform('web')}
                className={`
                  flex flex-1 items-center justify-center gap-2 rounded-lg border p-4
                  transition-colors
                  ${platforms.includes('web')
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input hover:bg-accent'
                  }
                `}
              >
                <Globe className="h-5 w-5" />
                <span className="font-medium">{tCommon('web')}</span>
              </button>
              <button
                type="button"
                onClick={() => togglePlatform('ios')}
                className={`
                  flex flex-1 items-center justify-center gap-2 rounded-lg border p-4
                  transition-colors
                  ${platforms.includes('ios')
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input hover:bg-accent'
                  }
                `}
              >
                <Smartphone className="h-5 w-5" />
                <span className="font-medium">{tCommon('ios')}</span>
              </button>
            </div>
            {error && platforms.length === 0 && (
              <p className="text-sm text-destructive">{t('platformRequired')}</p>
            )}
          </div>

          {error && appName && platforms.length > 0 && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tCommon('create')} App
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
