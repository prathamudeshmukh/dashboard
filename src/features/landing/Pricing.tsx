'use client';

import { useState } from 'react';

import { PricingCard, type PricingPlan } from '@/components/landing/PricingCard';
import { Button } from '@/components/ui/button';

const pricingPlans = {
  monthly: [
    {
      id: 'plan3',
      name: 'Plan 3',
      price: 950,
      cta: 'Get plan now',
      features: [
        { text: 'Each PDF generation API call deducts 1 credit from your balance.' },
        { text: 'Once your credits are exhausted, you can contact us at support@templify.cloud to replenish your balance.' },
      ],
    },
    {
      id: 'plan1',
      name: 'Plan 1',
      price: 1200,
      isPopular: true,
      cta: 'Start 2-week free trial now',
      features: [
        { text: 'Each PDF generation API call deducts 1 credit from your balance.' },
        { text: 'Once your credits are exhausted, you can contact us at support@templify.cloud to replenish your balance.' },
        { text: 'No hidden fees, no complicated pricing – just pay as you go.' },
        { text: 'Each PDF generation API call deducts 1 credit from your balance.' },
      ],
    },
    {
      id: 'plan2',
      name: 'Plan 2',
      price: 800,
      cta: 'Get plan now',
      features: [
        { text: 'Each PDF generation API call deducts 1 credit from your balance.' },
        { text: 'Once your credits are exhausted, you can contact us at support@templify.cloud to replenish your balance.' },
      ],
    },
  ],
  yearly: [
    {
      id: 'plan3',
      name: 'Plan 3',
      price: 9500,
      cta: 'Get plan now',
      features: [
        { text: 'Save 2 months with annual billing.' },
        { text: 'Each PDF generation API call deducts 1 credit from your balance.' },
      ],
    },
    {
      id: 'plan1',
      name: 'Plan 1',
      price: 12000,
      isPopular: true,
      cta: 'Start 2-week free trial now',
      features: [
        { text: 'Save 2 months with annual billing.' },
        { text: 'No hidden fees, no complicated pricing – just pay as you go.' },
        { text: 'Each PDF generation API call deducts 1 credit from your balance.' },
        { text: 'Once your credits are exhausted, you can contact us at support@templify.cloud to replenish your balance.' },
      ],
    },
    {
      id: 'plan2',
      name: 'Plan 2',
      price: 8000,
      cta: 'Get plan now',
      features: [
        { text: 'Save 2 months with annual billing.' },
        { text: 'Each PDF generation API call deducts 1 credit from your balance.' },
      ],
    },
  ],
};

export default function Pricing() {
  const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-4xl font-semibold md:text-5xl lg:text-6xl">
          Flexible Plans for
          <br />
          Every Need
        </h2>

        <div className="mb-12 flex justify-center">
          <div className="inline-flex items-center rounded-full p-1">
            <Button
              variant="ghost"
              className={`rounded-full px-6 py-2 text-2xl font-semibold ${pricingPeriod === 'monthly' ? 'bg-templify-gray' : ' bg-transparent'
              }`}
              onClick={() => setPricingPeriod('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant="ghost"
              className={`rounded-full px-6 py-2 text-2xl font-semibold ${pricingPeriod === 'yearly' ? 'bg-templify-gray' : ' bg-transparent'
              }`}
              onClick={() => setPricingPeriod('yearly')}
            >
              Yearly
            </Button>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {pricingPlans[pricingPeriod].map(plan => (
            <PricingCard key={plan.id} plan={plan as PricingPlan} />
          ))}
        </div>
      </div>
    </section>
  );
}
