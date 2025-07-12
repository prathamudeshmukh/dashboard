import { useTranslations } from 'next-intl';

import type { FeatureContent } from '@/types/Features';

export const useFeatures = (): FeatureContent[] => {
  const t = useTranslations('Features');

  const featureKeys = ['feature1', 'feature2', 'feature3', 'feature4', 'feature5', 'feature6', 'feature7'] as const;

  return featureKeys.map((key) => {
    const featureData = t.raw(key);
    return { ...featureData };
  });
};
