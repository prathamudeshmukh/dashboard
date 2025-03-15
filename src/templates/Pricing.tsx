import { ArrowRight, CheckCircle2, CreditCard } from 'lucide-react';
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
        title={t('title')}
        subtitle={t('subtitle')}
        icon={CreditCard}
        description={t('description')}
      >
        <div className="container px-4 md:px-6">
          <div className="mx-auto mt-8 max-w-3xl space-y-6">
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 size-5 text-primary" />
                    {t('pricing_label1')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 size-5 text-primary" />
                    {t('pricing_label2')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 size-5 text-primary" />
                    {t('pricing_label3')}
                  </li>
                </ul>
              </CardContent>
            </Card>
            <div className="flex justify-center">
              <Button size="lg" className="gap-1">
                {t('cta')}
                {' '}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </div>

  );
};

export default Pricing;
