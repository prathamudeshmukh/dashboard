'use client';

import { useTranslations } from 'next-intl';

import LegalPage from '@/features/legal/LegalPage';

export default function TermsOfService() {
  const t = useTranslations('ToS');
  const termsSections = [
    {
      id: 'introduction',
      title: t('introduction.title'),
      content: t('introduction.content'),
    },
    {
      id: 'information-we-collect',
      title: t('information.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>
            {t.rich('information.content.content1', {
              important: chunks => (
                <span>
                  <strong>{chunks}</strong>
                </span>
              ),
            })}
          </li>
          <li>
            {t.rich('information.content.content2', {
              important: chunks => (
                <span>
                  <strong>{chunks}</strong>
                </span>
              ),
            })}
          </li>
          <li>
            {t.rich('information.content.content3', {
              important: chunks => (
                <span>
                  <strong>{chunks}</strong>
                </span>
              ),
            })}
          </li>
        </ul>
      ),
    },
    {
      id: 'user-account',
      title: t('userAccounts.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>{t('userAccounts.content.content1')}</li>
          <li>{t('userAccounts.content.content2')}</li>
          <li>{t('userAccounts.content.content3')}</li>
        </ul>
      ),
    },
    {
      id: 'use-service',
      title: t('useOfService.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>{t('useOfService.content.content1')}</li>
          <li>{t('useOfService.content.content2')}</li>
          <li>{t('useOfService.content.content3')}</li>
        </ul>
      ),
    },
    {
      id: 'payment',
      title: t('payment.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>{t('payment.content.content1')}</li>
          <li>{t('payment.content.content2')}</li>
          <li>{t('payment.content.content3')}</li>
        </ul>
      ),
    },
    {
      id: 'data-privacy',
      title: t('dataPrivacy.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>{t('dataPrivacy.content.content1')}</li>
          <li>{t('dataPrivacy.content.content2')}</li>
        </ul>
      ),
    },
    {
      id: 'limitation',
      title: t('limitation.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>{t('limitation.content.content1')}</li>
          <li>{t('limitation.content.content2')}</li>
        </ul>
      ),
    },
    {
      id: 'changes',
      title: t('changes.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>{t('changes.content.content1')}</li>
          <li>{t('changes.content.content2')}</li>
        </ul>
      ),
    },
  ];

  return (
    <LegalPage title={t('title')} sections={termsSections} contactEmail="support@templify.com" />
  );
}
