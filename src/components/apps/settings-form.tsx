'use client';

import { useState } from 'react';
import { App, AppSettings } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SettingsFormProps {
  app: App;
  onSave: (settings: Partial<AppSettings>) => Promise<void>;
}

export function SettingsForm({ app, onSave }: SettingsFormProps) {
  const [settings, setSettings] = useState<AppSettings>(app.settings);
  const [newOrigin, setNewOrigin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const t = useTranslations('appSettings');

  const handleAddOrigin = () => {
    if (!newOrigin.trim()) return;

    try {
      new URL(newOrigin);
      setSettings((prev) => ({
        ...prev,
        allowedOrigins: [...prev.allowedOrigins, newOrigin.trim()],
      }));
      setNewOrigin('');
    } catch {
      setError(t('invalidUrl'));
    }
  };

  const handleRemoveOrigin = (origin: string) => {
    setSettings((prev) => ({
      ...prev,
      allowedOrigins: prev.allowedOrigins.filter((o) => o !== origin),
    }));
  };

  const toggleLanguage = (lang: 'eng' | 'jpn') => {
    setSettings((prev) => ({
      ...prev,
      supportedLanguages: prev.supportedLanguages.includes(lang)
        ? prev.supportedLanguages.filter((l) => l !== lang)
        : [...prev.supportedLanguages, lang],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (settings.supportedLanguages.length === 0) {
      setError(t('atLeastOneLanguage'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await onSave(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('requestSettings')}</CardTitle>
          <CardDescription>{t('requestSettingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="cooldown" className="text-sm font-medium">
              {t('cooldown')}
            </label>
            <Input
              id="cooldown"
              type="number"
              min={0}
              max={3600}
              value={settings.cooldownSeconds}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  cooldownSeconds: parseInt(e.target.value) || 0,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              {t('cooldownDesc')}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('allowedOrigins')}</label>
            <div className="flex gap-2">
              <Input
                placeholder={t('allowedOriginsPlaceholder')}
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={handleAddOrigin}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {settings.allowedOrigins.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {settings.allowedOrigins.map((origin) => (
                  <Badge key={origin} variant="outline" className="gap-1">
                    {origin}
                    <button
                      type="button"
                      onClick={() => handleRemoveOrigin(origin)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {t('allowedOriginsDesc')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('languageSettings')}</CardTitle>
          <CardDescription>{t('languageSettingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => toggleLanguage('eng')}
              className={`
                flex-1 rounded-lg border-2 p-4 text-center transition-all
                ${settings.supportedLanguages.includes('eng')
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-muted bg-muted/30 text-muted-foreground opacity-50'
                }
              `}
            >
              <span className="font-medium">{t('english')}</span>
            </button>
            <button
              type="button"
              onClick={() => toggleLanguage('jpn')}
              className={`
                flex-1 rounded-lg border-2 p-4 text-center transition-all
                ${settings.supportedLanguages.includes('jpn')
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
          <CardTitle>{t('privacySettings')}</CardTitle>
          <CardDescription>{t('privacySettingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label htmlFor="contextLogging" className="text-sm font-medium">
              {t('contextLoggingMode')}
            </label>
            <Select
              id="contextLogging"
              value={settings.contextLoggingMode}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  contextLoggingMode: e.target.value as AppSettings['contextLoggingMode'],
                }))
              }
              options={[
                { value: 'none', label: t('loggingNone') },
                { value: 'truncated', label: t('loggingTruncated') },
                { value: 'hashed', label: t('loggingHashed') },
                { value: 'full', label: t('loggingFull') },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">{t('settingsSaved')}</p>}

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('saveSettings')}
      </Button>
    </form>
  );
}
