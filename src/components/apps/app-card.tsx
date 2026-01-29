'use client';

import { App } from '@/types/app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Smartphone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { timestampToDate } from '@/lib/utils/timestamp';
import { useTranslations } from 'next-intl';

interface AppCardProps {
  app: App;
}

export function AppCard({ app }: AppCardProps) {
  const t = useTranslations('common');

  return (
    <Link href={`/apps/${app.appId}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">{app.appName}</CardTitle>
          <Badge variant={app.status === 'active' ? 'success' : 'destructive'}>
            {app.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {app.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="flex items-center gap-1 text-sm text-muted-foreground"
                  >
                    {platform === 'web' ? (
                      <Globe className="h-4 w-4" />
                    ) : (
                      <Smartphone className="h-4 w-4" />
                    )}
                    {platform === 'web' ? t('web') : t('ios')}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('created', { date: format(timestampToDate(app.meta.createdAt), 'MMM d, yyyy') })}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
