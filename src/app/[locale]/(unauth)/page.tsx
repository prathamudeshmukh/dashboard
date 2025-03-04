import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { CTA } from '@/templates/CTA';
import { Footer } from '@/templates/Footer';
import { Hero } from '@/templates/Hero';
import { KeyFeatures } from '@/templates/KeyFeatures';
import { Navbar } from '@/templates/Navbar';
import { SecurityFeatures } from '@/templates/SecurityFeatures';
import { Working } from '@/templates/Working';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const IndexPage = (props: { params: { locale: string } }) => {
  unstable_setRequestLocale(props.params.locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Working />
        <KeyFeatures />
        <SecurityFeatures />
        <CTA />
        <Footer />
      </main>
    </div>
  );
};

export default IndexPage;
