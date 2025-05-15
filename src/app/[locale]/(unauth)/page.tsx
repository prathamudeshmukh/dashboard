/* eslint-disable react-dom/no-dangerously-set-innerhtml */
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import About from '@/features/landing/About';
import { CTA } from '@/features/landing/CTA';
import { FAQ } from '@/features/landing/FAQ';
import Features from '@/features/landing/Features';
import { Footer } from '@/features/landing/Footer';
import { Hero } from '@/features/landing/Hero';
import { Navbar } from '@/features/landing/Navbar';
import Pricing from '@/features/landing/Pricing';
import Steps from '@/features/landing/Steps';
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

  const menuList = [
    { link: '#about', name: 'About' },
    { link: '#how-it-works', name: 'How it Works' },
    { link: '#features', name: 'Feature' },
    { link: '#pricing', name: 'Pricing' },
    { link: '/docs', name: 'Docs' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </section>
      <Navbar menuList={menuList} />
      <main className="flex-1">
        <Hero />
        <About />
        <Features />
        <Steps />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </main>
    </div>
  );
};

export default IndexPage;
