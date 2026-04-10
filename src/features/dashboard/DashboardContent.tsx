'use client';

import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import TemplateTable from './TemplateTable';
import { TitleBar } from './TitleBar';

export const DashboardContent = () => {
  const [isFtux, setIsFtux] = useState(false);
  const t = useTranslations('DashboardIndex');

  return (
    <>
      {!isFtux && <TitleBar title={t('title_bar')} />}
      <div className="flex flex-col rounded-2xl bg-card p-5 shadow-2xl">
        <div className="mt-5">
          <TemplateTable onFtuxChange={setIsFtux} />
        </div>
      </div>
    </>
  );
};
