import { useTranslations } from 'next-intl';

import { DashboardContent } from '@/features/dashboard/DashboardContent';
import { TitleBar } from '@/features/dashboard/TitleBar';

const DashboardIndexPage = () => {
  const t = useTranslations('DashboardIndex');

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <DashboardContent />
    </>
  );
};

export default DashboardIndexPage;
