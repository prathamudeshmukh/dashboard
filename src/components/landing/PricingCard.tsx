import { Check } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export type Feature = {
  text: string;
};

export type PricingPlan = {
  id: string;
  name: string;
  price: number | string;
  icon: React.ReactNode;
  isPopular?: boolean;
  features: Feature[];
  cta: string;
  href: string;
  description?: string;
};

type PricingCardProps = {
  plan: PricingPlan;
};

export const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  const { name, price, icon, href, isPopular, features, cta, description } = plan;

  return (
    <Card className={`${isPopular ? ' relative border-2 border-primary shadow-xl' : 'flex flex-col'}`}>
      {isPopular && (
        <div className="absolute top-0 flex w-full -translate-y-1/2 justify-center">
          <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white">Most Popular</span>
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="mb-2 flex items-center gap-3">
          {icon}
          <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        </div>
        {description && (
          <CardDescription className="ml-2 text-gray-600">{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="grow">
        <div className="flex items-baseline">
          <span className="text-5xl font-bold">
            {typeof price === 'number' ? `$${price}` : price}
          </span>
          <span className="ml-2 text-gray-600">{typeof price === 'number' ? `/month` : ''}</span>
        </div>

        <ul className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="mt-1 size-5 shrink-0 text-green-600" />
              <p className="text-sm text-gray-700">{feature.text}</p>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>

        <Button variant={isPopular ? 'default' : 'outline'} className={`${isPopular ? 'w-full rounded-full text-sm' : 'w-full rounded-full text-sm text-black'}`}>
          <Link href={href}>
            {cta}
          </Link>
        </Button>

      </CardFooter>
    </Card>
  );
};
