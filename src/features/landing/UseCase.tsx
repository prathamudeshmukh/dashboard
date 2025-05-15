import { FileText, GraduationCap, ShoppingCart, Stethoscope } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Section } from '@/components/landing/Section';

export const UseCase = () => {
  const t = useTranslations('UseCase');
  return (
    <Section
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="mt-6 space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-100 p-4 shadow">
          <GraduationCap className="text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('useCase1')}</h3>
            <p className="text-gray-700">{t('useCase1_description')}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-100 p-4 shadow">
          <ShoppingCart className="text-green-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('useCase2')}</h3>
            <p className="text-gray-700">{t('useCase2_description')}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-100 p-4 shadow">
          <Stethoscope className="text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('useCase3')}</h3>
            <p className="text-gray-700">{t('useCase3_description')}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-100 p-4 shadow">
          <FileText className="text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('useCase4')}</h3>
            <p className="text-gray-700">{t('useCase4_description')}</p>
          </div>
        </div>
      </div>

    </Section>
  );
};
