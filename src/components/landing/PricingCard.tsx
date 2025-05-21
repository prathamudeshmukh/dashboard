import { Icon } from '@iconify-icon/react/dist/iconify.mjs';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export type Feature = {
  text: string;
};

export type PricingPlan = {
  id: string;
  name: string;
  price: number;
  isPopular?: boolean;
  features: Feature[];
  cta: string;
};

type PricingCardProps = {
  plan: PricingPlan;
};

export const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const { name, price, isPopular, features, cta } = plan;

  return (
    <Card
      className={`overflow-hidden ${isPopular
        ? 'relative z-10 -mt-4 rounded-3xl border-0 bg-templify-lightgray'
        : 'h-[480px] rounded-3xl border-0 bg-templify-lightgray'
      }`}
    >
      <div className="p-8">
        <h3 className="text-2xl font-semibold text-primary">{name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-6xl font-semibold text-primary">
            Rs.
            {price}
          </span>
          <span className="ml-2 text-base font-normal text-gray-600">/Monthly</span>
        </div>

        <div className="mt-8">
          <h4 className="mb-4 text-xl font-semibold text-gray-700">What we cover</h4>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Icon icon="teenyicons:tick-circle-outline" width="24" height="24" />
                <p className="text-base font-normal text-gray-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Button className="mt-8 rounded-full text-xl font-normal">{cta}</Button>
        </div>
      </div>
    </Card>
  );
};
