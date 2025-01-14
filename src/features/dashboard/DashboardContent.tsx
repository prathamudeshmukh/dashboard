import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';

import TemplateTable from './TemplateTable';

export const DashboardContent = () => {
  const t = useTranslations('DashboardContent');
  return (
    <div className="flex h-[600px] flex-col rounded-md bg-card p-5">
      <div className="mt-3 text-center">
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
