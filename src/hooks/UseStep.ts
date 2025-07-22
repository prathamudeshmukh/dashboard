import { useTranslations } from 'next-intl';

import type { StepContent } from '@/types/Steps';

export const useSteps = (): StepContent[] => {
  const t = useTranslations('Steps');

  const stepKeys = ['step1', 'step2', 'step3'] as const;

  return stepKeys.map((key) => {
    const stepData = t.raw(key) as StepContent;
    return { ...stepData };
  });
};
