import { useTranslations } from 'next-intl';

import { DashboardContent } from '@/features/dashboard/DashboardContent';
import { ShowClientSecret } from '@/features/dashboard/ShowClientSecret';
import { TitleBar } from '@/features/dashboard/TitleBar';

const DashboardIndexPage = () => {
  const t = useTranslations('DashboardIndex');

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <ShowClientSecret clientId="user_2rWNWmW7eCWtkDDnyrMIAyV8r6o" />

      <DashboardContent />
    </>
  );
};

export default DashboardIndexPage;
