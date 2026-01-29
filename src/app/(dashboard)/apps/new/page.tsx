'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { AppForm } from '@/components/apps/app-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function NewAppPage() {
  const t = useTranslations('appForm');

  return (
    <div className="flex min-h-screen flex-col">
      <Header title={t('title')} description={t('description')}>
        <Link href="/apps">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToApps')}
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6">
        <AppForm />
      </div>
    </div>
  );
}
