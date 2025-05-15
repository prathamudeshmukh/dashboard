'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

export const Hero = () => {
  const t = useTranslations('Hero');

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-center text-center">
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-600">
            {t('subtitle')}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button variant="outline" className="rounded-full border-black px-4 py-3 text-base">
              Get Demo
            </Button>
            <Link href="/sign-up">
              <Button className="rounded-full bg-primary px-4 py-3 text-base hover:bg-primary">
                {t('primary_button')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard UI Mockup */}
        <div className="relative mx-auto mt-24 max-w-5xl">
          <div className="absolute -inset-10 rounded-[30px] bg-gradient-to-br from-indigo-400 via-purple-300 to-blue-400 opacity-80 blur-2xl"></div>
          <div className="relative z-10 overflow-hidden rounded-lg border bg-white p-2 shadow-xl">
            <Image
              src="/images/dashboard.png"
              alt="Templify Dashboard"
              width={1200}
              height={600}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
