'use client';

import { useState } from 'react';
import { App, AppSettings } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X } from 'lucide-react';

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
      setError('Invalid URL format');
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
      setError('At least one language is required');
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
          <CardTitle>Request Settings</CardTitle>
          <CardDescription>Configure how ad requests are handled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="cooldown" className="text-sm font-medium">
              Cooldown (seconds)
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
              Minimum time between ad requests from the same user
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Allowed Origins</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
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
              Leave empty to allow all origins
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language Settings</CardTitle>
          <CardDescription>Configure supported languages for ads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => toggleLanguage('eng')}
              className={`
                flex-1 rounded-lg border p-4 text-center transition-colors
                ${settings.supportedLanguages.includes('eng')
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input hover:bg-accent'
                }
              `}
            >
              <span className="font-medium">English</span>
            </button>
            <button
              type="button"
              onClick={() => toggleLanguage('jpn')}
              className={`
                flex-1 rounded-lg border p-4 text-center transition-colors
                ${settings.supportedLanguages.includes('jpn')
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input hover:bg-accent'
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
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Configure how context text is logged</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label htmlFor="contextLogging" className="text-sm font-medium">
              Context Logging Mode
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
                { value: 'none', label: 'None - Do not log context' },
                { value: 'truncated', label: 'Truncated - First 64 characters' },
                { value: 'hashed', label: 'Hashed - SHA-256 hash only' },
                { value: 'full', label: 'Full - Store complete text' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">Settings saved successfully</p>}

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Settings
      </Button>
    </form>
  );
}
