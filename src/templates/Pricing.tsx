import { CheckCircle2, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Section } from '@/features/landing/Section';

const Pricing = () => {
  const t = useTranslations('Pricing');
  return (
    <div id="pricing">
      <Section
        className="w-full bg-background py-12 md:py-24 lg:py-32"
        title={t('title')}
        icon={CreditCard}
        description={t('description')}
      >
        <div className="container px-4 md:px-6">
          <div className="mx-auto mt-8 max-w-3xl space-y-6">
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="flex"><CheckCircle2 className="mt-1 size-5 text-primary" /></div>
                    <span>{t('pricing_label1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex"><CheckCircle2 className="mt-1 size-5 text-primary" /></div>
                    <span className="">{t('pricing_label2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex"><CheckCircle2 className="mt-1 size-5 text-primary" /></div>
                    <span>{t('pricing_label3')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <div className="flex justify-center">
              <Button size="lg" className="gap-1">
                {t('cta')}
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </div>

  );
};

export default Pricing;
