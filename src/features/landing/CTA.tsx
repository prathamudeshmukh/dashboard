'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SUPPORT_EMAIL } from 'templify.constants';

import { Button } from '@/components/ui/button';

export const CTA = () => {
  const t = useTranslations('CTA');
  const { isSignedIn } = useUser();

  return (
    <section id="contact" className="bg-templify-lightgray py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-6 text-4xl font-semibold ">{t('title')}</h2>
        <p className="mb-8 text-xl font-semibold">{t('description')}</p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href={`mailto:${SUPPORT_EMAIL}`}>
            <Button variant="outline" className=" rounded-full border-black px-4 py-3 text-xl font-normal">
              Contact us
            </Button>
          </Link>
          {!isSignedIn
          && (
            <Link href="/sign-in">
              <Button className="rounded-full bg-primary px-4 py-3 text-xl font-normal">Start free trial</Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
