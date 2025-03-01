import { Mail, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Section } from '@/features/landing/Section';

export const SecurityFeatures = () => {
  const t = useTranslations('SecurityFeatures');

  const securityFeatures = [
    {
      icon: <ShieldCheck className="text-blue-500" />,
      title: t('feature1'),
      description: t('feature1_description'),
    },
    {
      icon: <Zap className="text-green-500" />,
      title: t('feature2'),
      description: t('feature2_description'),
    },
    {
      icon: <Mail className="text-red-500" />,
      title: t('feature3_description'),
      description: t('feature3_description'),
    },
    {
      icon: <TrendingUp className="text-purple-500" />,
      title: t('feature4_description'),
      description: t('feature4_description'),
    },
  ];
  return (
    <Section
      title={t('title')}
      subtitle={t('subtitle')}
    >

      <div className="mt-6 space-y-4">
        {securityFeatures.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-100 p-4 shadow">
            {feature.icon}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};
