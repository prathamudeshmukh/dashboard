'use client';

import { useTranslations } from 'next-intl';

const FREELANCE_KIT_URL = 'https://examples.templify.cloud/';
const GITHUB_URL = 'https://github.com/prathamudeshmukh/templify/tree/main/examples/freelance-kit';

const DOC_TYPES = [
  { emoji: '📄', label: 'Proposal', envVar: 'TEMPLIFY_PROPOSAL_TEMPLATE_ID' },
  { emoji: '📝', label: 'Contract', envVar: 'TEMPLIFY_CONTRACT_TEMPLATE_ID' },
  { emoji: '🧾', label: 'Invoice', envVar: 'TEMPLIFY_INVOICE_TEMPLATE_ID' },
  { emoji: '✅', label: 'Receipt', envVar: 'TEMPLIFY_RECEIPT_TEMPLATE_ID' },
];

const DOC_TYPE_LABELS = ['Proposal', 'Contract', 'Invoice', 'Receipt'];

export default function Showcase() {
  const t = useTranslations('Showcase');

  return (
    <section id="examples" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-3 text-base text-gray-500">
            {t('subtitle')}
          </p>
        </div>

        {/* Showcase card */}
        <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">

            {/* Left: app description + CTAs */}
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">🗂️</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('app_name')}</h3>
                  <span className="text-xs font-medium text-primary">Live example</span>
                </div>
              </div>

              <p className="mb-5 text-sm leading-relaxed text-gray-600">
                {t('app_description')}
              </p>

              {/* Doc type pills */}
              <div className="mb-6 flex flex-wrap gap-2">
                {DOC_TYPE_LABELS.map(label => (
                  <span
                    key={label}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={FREELANCE_KIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {t('cta_try')}
                  <span aria-hidden="true">→</span>
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400"
                >
                  {t('cta_source')}
                  <span aria-hidden="true" className="text-xs">↗</span>
                </a>
              </div>
            </div>

            {/* Right: template ID map (hidden on mobile) */}
            <div className="hidden shrink-0 rounded-xl bg-gray-50 p-5 md:block md:w-64">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                How it works
              </p>
              <div className="space-y-2.5">
                {DOC_TYPES.map(({ emoji, label, envVar }) => (
                  <div key={label} className="flex items-start gap-2">
                    <span className="mt-0.5 text-base leading-none">{emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-700">{label}</div>
                      <code className="block truncate text-[10px] text-gray-400">{envVar}</code>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[10px] leading-relaxed text-gray-400">
                One API call per doc type. Swap the template ID — Templify handles the rest.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
