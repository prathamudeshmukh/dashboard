/* eslint-disable react-dom/no-dangerously-set-innerhtml */
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { ScrollDepthTracker } from '@/components/analytics/ScrollDepthTracker';
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
    keywords: 'PDF generation API, dynamic PDF templates, no-code PDF builder, Handlebars templates, SaaS PDF automation, document generation, PDF API, template engine, enterprise PDF solution',
    authors: [{ name: 'Templify Team' }],
    creator: 'Templify',
    publisher: 'Templify',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        'index': true,
        'follow': true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      url: getBaseUrl(),
      type: 'website',
      siteName: 'Templify Cloud',
      locale: props.params.locale,
      images: [
        {
          url: `${getBaseUrl()}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: 'Templify - API-First PDF Generation Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('meta_description'),
      images: [`${getBaseUrl()}/twitter-image.png`],
      creator: '@templify_cloud',
      site: '@templify_cloud',
    },
    alternates: {
      canonical: getBaseUrl(),
      languages: {
        en: `${getBaseUrl()}/en`,
        fr: `${getBaseUrl()}/fr`,
      },
    },
    other: {
      'application-name': 'Templify',
      'apple-mobile-web-app-title': 'Templify',
      'theme-color': '#2563eb',
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
    'image': `${getBaseUrl()}/logo-full.png`,
    'description': 'API-first & No-Code PDF generation platform for SaaS companies. Generate dynamic PDFs with Handlebars templates, drag-and-drop editor, and enterprise-scale performance.',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Cloud-based',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'description': 'Start with 150 free credits',
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'ratingCount': '150',
      'bestRating': '5',
    },
    'featureList': [
      'API-first PDF generation',
      'No-code template editor',
      'Handlebars template engine',
      'Real-time preview',
      'Enterprise scalability',
      '99.9% uptime SLA',
      'Secure API authentication',
    ],
    'screenshot': `${getBaseUrl()}/images/dashboard.png`,
    'author': {
      '@type': 'Organization',
      'name': 'Templify',
      'url': getBaseUrl(),
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Templify',
      'logo': {
        '@type': 'ImageObject',
        'url': `${getBaseUrl()}/logo-full.png`,
      },
    },
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

      {/* ✅ Track page view */}
      <PageViewTracker />

      {/* ✅ Track scroll depth */}
      <ScrollDepthTracker />

      <main className="flex-1">
        <Hero />
        <About />
        <Features />
        <Steps />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default IndexPage;
