import type { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { DocsPageTracker } from '@/components/analytics/DocsPageTracker';
import { getBaseUrl } from '@/utils/Helpers';

import DocsContent from './DocsContent';

export async function generateMetadata(props: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Docs',
  });

  const baseUrl = getBaseUrl();
  const docsUrl = `${baseUrl}/${props.params.locale}/docs`;

  return {
    metadataBase: new URL(baseUrl),
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: t('meta_keywords'),
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
      title: t('og_title'),
      description: t('og_description'),
      url: docsUrl,
      siteName: 'Templify Cloud',
      locale: props.params.locale,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: 'Templify API Documentation',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitter_title'),
      description: t('twitter_description'),
      images: [`${baseUrl}/twitter-image.png`],
      creator: '@templify_cloud',
      site: '@templify_cloud',
    },
    alternates: {
      canonical: docsUrl,
      languages: {
        en: `${baseUrl}/en/docs`,
        fr: `${baseUrl}/fr/docs`,
      },
    },
    other: {
      'application-name': 'Templify',
      'apple-mobile-web-app-title': 'Templify Docs',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#2563eb',
      'theme-color': '#2563eb',
    },
  };
}

export default function DocsPage(props: { params: { locale: string } }) {
  unstable_setRequestLocale(props.params.locale);

  // Structured data for better SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': 'Templify API Documentation - Complete Developer Guide',
    'description': 'Complete Templify API documentation with authentication, endpoints, examples, and best practices. Learn to integrate PDF generation into your SaaS application.',
    'url': `${getBaseUrl()}/${props.params.locale}/docs`,
    'datePublished': '2024-01-01',
    'dateModified': new Date().toISOString().split('T')[0],
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
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${getBaseUrl()}/${props.params.locale}/docs`,
    },
    'about': {
      '@type': 'SoftwareApplication',
      'name': 'Templify API',
      'description': 'API-first PDF generation service for SaaS applications',
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'Cloud-based',
    },
    'keywords': [
      'API documentation',
      'PDF generation',
      'SaaS integration',
      'template management',
      'developer guide',
      'REST API',
      'authentication',
      'code examples',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DocsPageTracker />
      <DocsContent />
    </>
  );
}
