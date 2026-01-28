'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { AppForm } from '@/components/apps/app-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewAppPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Create App" description="Add a new app to your organization">
        <Link href="/apps">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Apps
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6">
        <AppForm />
      </div>
    </div>
  );
}
