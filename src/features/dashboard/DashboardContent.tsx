import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';

import { ShowClientSecret } from './ShowClientSecret';
import TemplateTable from './TemplateTable';

export const DashboardContent = () => {
  const t = useTranslations('DashboardContent');
  const { userId } = auth();
  return (
    <div className="flex  flex-col rounded-2xl bg-card p-5 shadow-2xl">
      <div className="mt-3 text-center">
        <ShowClientSecret clientId={userId as string} />
        <div className="text-xl font-semibold">{t('title')}</div>
      </div>
      <div className="mt-5 flex items-end justify-end">
        <Link href="/dashboard/template-dashboard">
          <Button>{t('create_new_template')}</Button>
        </Link>
      </div>
      <div className="mt-5"><TemplateTable /></div>
    </div>
  );
};
