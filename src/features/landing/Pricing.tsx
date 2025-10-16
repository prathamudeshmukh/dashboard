'use client';

import { Briefcase, Building2, Gift, Rocket } from 'lucide-react';
import { SUPPORT_EMAIL } from 'templify.constants';

import { PricingCard, type PricingPlan } from '@/components/landing/PricingCard';
import { trackEvent } from '@/libs/analytics/trackEvent';

const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with our core features.',
    icon: <Gift className="size-8 text-primary" />,
    price: 0,
    cta: 'Get started for free',
    href: '/sign-in',
    features: [
      { text: '150 credits to start.' },
      { text: '1 credit = 1 PDF generation.' },
      { text: 'Community support.' },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams and growing businesses.',
    price: 15,
    icon: <Briefcase className="size-8 text-primary" />,
    cta: 'Choose Starter',
    href: `mailto:${SUPPORT_EMAIL}`,
    isPopular: true,
    features: [
      { text: '500 credits/month.' },
      { text: '$5 per additional 250 credits.' },
      { text: 'Email support.' },
      { text: 'All free plan features.' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For established businesses and high-volume users.',
    price: 39,
    icon: <Rocket className="size-8 text-primary" />,
    cta: 'Choose Pro',
    href: `mailto:${SUPPORT_EMAIL}`,
    features: [
      { text: '1500 credits/month.' },
      { text: '$3 per additional 250 credits.' },
      { text: 'Priority support.' },
      { text: 'All starter plan features.' },

    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Tailored solutions for large-scale deployments.',
    price: 'Custom',
    icon: <Building2 className="size-8 text-primary" />,
    cta: 'Conact Sales',
    href: `mailto:${SUPPORT_EMAIL}`,
    features: [
      { text: 'Custom credit allocation.' },
      { text: 'Dedicated account manager.' },
      { text: 'Custom integrations.' },
      { text: 'Premium support & SLA.' },
    ],
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      onMouseEnter={() =>
        trackEvent('pricing_section_viewed', {
          time_on_page: Math.round(performance.now() / 1000),
          from_section: 'pricing',
        })}
      className="py-20"
    >
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Simple, Credit-Based Pricing</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Choose a plan that fits your needs. 1 credit equals 1 PDF generation. No hidden fees.
          </p>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map(plan => (
            <PricingCard key={plan.id} plan={plan as PricingPlan} />
          ))}
        </div>
      </div>
    </section>
  );
}
