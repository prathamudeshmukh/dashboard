'use client';

import { useTranslations } from 'next-intl';

import LegalPage from '@/features/legal/LegalPage';

export default function PrivacyPolicy() {
  const t = useTranslations('Privacy');
  const privacySections = [
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
      id: 'data-use',
      title: t('howWeUseData.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>{t('howWeUseData.content.content1')}</li>
          <li>{t('howWeUseData.content.content2')}</li>
          <li>{t('howWeUseData.content.content3')}</li>
        </ul>
      ),
    },
    {
      id: 'data-sharing',
      title: t('dataSharing.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>{t('dataSharing.content.content1')}</li>
          <li>{t('dataSharing.content.content2')}</li>
          <li>{t('dataSharing.content.content3')}</li>
        </ul>
      ),
    },
    {
      id: 'security',
      title: t('security.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>{t('security.content.content1')}</li>
          <li>{t('security.content.content2')}</li>
        </ul>
      ),
    },
    {
      id: 'retention',
      title: t('retention.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>{t('retention.content.content1')}</li>
          <li>{t('retention.content.content2')}</li>
        </ul>
      ),
    },
    {
      id: 'rights',
      title: t('rights.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>{t('rights.content.content1')}</li>
          <li>{t('rights.content.content2')}</li>
          <li>{t('rights.content.content3')}</li>
        </ul>
      ),
    },
    {
      id: 'changes',
      title: t('changes.title'),
      content: (
        <ul className="list-disc space-y-3 pl-6">
          <li>{t('changes.content.content1')}</li>
        </ul>
      ),
    },
  ];

  return (
    <LegalPage title={t('title')} sections={privacySections} contactEmail="privacy@templify.com" />
  );
}
