import { Check } from 'lucide-react';
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
        : 'h-96 rounded-3xl border-0 bg-templify-lightgray'
      }`}
    >
      <div className="p-8">
        <h3 className="text-xl font-bold text-primary">{name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-5xl font-bold">
            Rs.
            {price}
          </span>
          <span className="ml-2 text-gray-600">/Monthly</span>
        </div>

        <div className="mt-8">
          <h4 className="mb-4 text-sm font-medium">What we cover</h4>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                <p className="text-sm text-gray-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Button className="mt-8 rounded-full">{cta}</Button>
        </div>
      </div>
    </Card>
  );
};
