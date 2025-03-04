/* eslint-disable react-dom/no-dangerously-set-innerhtml */
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { CTA } from '@/templates/CTA';
import { Footer } from '@/templates/Footer';
import { Hero } from '@/templates/Hero';
import { KeyFeatures } from '@/templates/KeyFeatures';
import { Navbar } from '@/templates/Navbar';
import { SecurityFeatures } from '@/templates/SecurityFeatures';
import { Working } from '@/templates/Working';
import { getBaseUrl } from '@/utils/Helpers';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      url: getBaseUrl(),
      type: 'website',
      siteName: 'Templify Cloud',
      images: [
        {
          url: `${getBaseUrl()}/opengraph-image.png`,
          width: 800,
          height: 600,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('meta_description'),
      images: [`${getBaseUrl()}/twitter-image.png`],
    },
  };
}

const IndexPage = (props: { params: { locale: string } }) => {
  unstable_setRequestLocale(props.params.locale);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Templify',
    'url': getBaseUrl(),
    'image': `${getBaseUrl()}/logo.png`,
    'description': 'API-first & No-Code PDF generation platform for SaaS companies.',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Cloud-based',
  };

  return (
    <div className="flex min-h-screen flex-col">
      <section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </section>
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
