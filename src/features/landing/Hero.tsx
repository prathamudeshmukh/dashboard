'use client';

import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export const Hero = () => {
  const t = useTranslations('Hero');

  return (
    <section className="relative py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-center text-center">
          {/* ✨ Badge */}
          <div className="mb-4 flex items-center space-x-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 text-sm font-medium text-purple-700 shadow-sm">
            <Sparkles className="size-4 text-purple-600" />
            <span>{t('badge')}</span>
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl lg:font-semibold lg:tracking-normal">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Dashboard UI Mockup */}
        <div className="relative mx-auto mt-24 max-w-5xl">
          <div className="hero-radial-bg absolute -inset-5 -z-10 rounded-[30px] opacity-85 blur-2xl md:-inset-20"></div>
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
