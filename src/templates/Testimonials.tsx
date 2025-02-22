import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Section } from '@/features/landing/Section';

export const Testimonials = () => {
  const t = useTranslations('Reviews');

  const reviews = [
    {
      text: t('review1'),
    },
    {
      text: t('review2'),
    },
    {
      text: t('review3'),
    },
  ];
  return (
    <Section
      title="What User Say"
      subtitle="Testimonials"
    >

      <div className="mt-6 space-y-6">
        {reviews.map((review, index) => (
          <div key={index} className="rounded-lg border border-gray-100 bg-gray-100 p-4 shadow">

            <div className="mb-2 flex gap-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-5 fill-current" />
              ))}
            </div>

            <p className="text-gray-700">{review.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};
