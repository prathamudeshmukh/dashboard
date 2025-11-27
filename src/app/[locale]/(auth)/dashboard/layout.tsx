import { getTranslations } from 'next-intl/server';

import { DashboardSidebar } from '@/features/dashboard/DashboardSidebar';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function DashboardLayout(props: { children: React.ReactNode }) {
  // const t = useTranslations('DashboardLayout');

  return (
    <main className="min-h-screen bg-muted pt-4">
      <DashboardSidebar />
      <div className="mx-auto max-w-screen-xl px-3 pb-16">
        {props.children}
      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';
