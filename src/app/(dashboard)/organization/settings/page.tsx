'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@/contexts/organization-context';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function OrganizationSettingsPage() {
  const { currentOrg, refetchOrganizations } = useOrganization();
  const [name, setName] = useState(currentOrg?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const t = useTranslations('organization');

  // Update name when currentOrg changes
  if (currentOrg && name !== currentOrg.name && !loading) {
    setName(currentOrg.name);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/dashboard/organizations/${currentOrg.orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update organization');
      }

      refetchOrganizations();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  if (!currentOrg) {
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
              <CardTitle>{t('name')}</CardTitle>
              <CardDescription>
                {t('nameDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  required
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-green-600">{t('updated')}</p>}
                <Button type="submit" disabled={loading || name.trim() === currentOrg.name}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('saveChanges')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('id')}</CardTitle>
              <CardDescription>
                {t('idDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <code className="block rounded bg-muted px-3 py-2 text-sm">
                {currentOrg.orgId}
              </code>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
