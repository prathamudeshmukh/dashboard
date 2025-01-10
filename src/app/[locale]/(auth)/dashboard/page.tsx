import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { MessageState } from '@/features/dashboard/MessageState';
import TemplateTable from '@/features/dashboard/TemplateTable';
import { TitleBar } from '@/features/dashboard/TitleBar';

const DashboardIndexPage = () => {
  const t = useTranslations('DashboardIndex');

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <MessageState
        title={t('message_state_title')}
        button={(
          <Link href="/dashboard/template-dashboard">
            <Button>Create New Template</Button>
          </Link>
        )}
        table={(<TemplateTable />)}
      />
    </>
  );
};

export default DashboardIndexPage;
