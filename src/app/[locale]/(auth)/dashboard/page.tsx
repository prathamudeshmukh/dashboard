import { useTranslations } from 'next-intl';

import { DashboardContent } from '@/features/dashboard/DashboardContent';
import { TitleBar } from '@/features/dashboard/TitleBar';

const DashboardIndexPage = () => {
  const t = useTranslations('DashboardIndex');
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TitleBar
        title={t('title_bar')}
      />

      <DashboardContent />
    </div>
  );
};

export default DashboardIndexPage;
