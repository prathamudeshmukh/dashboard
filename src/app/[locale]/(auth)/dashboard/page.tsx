import { auth } from '@clerk/nextjs/server';
import { useTranslations } from 'next-intl';

import { DashboardContent } from '@/features/dashboard/DashboardContent';
import { ShowClientSecret } from '@/features/dashboard/ShowClientSecret';
import { TitleBar } from '@/features/dashboard/TitleBar';

const DashboardIndexPage = () => {
  const t = useTranslations('DashboardIndex');
  const { userId } = auth();

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <ShowClientSecret clientId={userId as string} />

      <DashboardContent />
    </>
  );
};

export default DashboardIndexPage;
