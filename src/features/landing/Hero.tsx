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
          {/* Product Hunt Badge */}
          <div className="mt-8">
            <a
              href="https://www.producthunt.com/products/templify-3?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-templify&#0045;3"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1031813&theme=neutral&t=1762436399237"
                alt="Templify - Turn any HTML into stunning PDFs at scale — instantly. | Product Hunt"
                width={250}
                height={54}
                unoptimized
              />
            </a>
          </div>
        </div>

        {/* Dashboard Video Mockup */}
        <div className="relative mx-auto mt-24 max-w-5xl">
          <div className="hero-radial-bg absolute -inset-5 -z-10 rounded-[30px] opacity-85 blur-2xl md:-inset-20"></div>
          <div className="relative z-10 overflow-hidden rounded-lg border bg-white p-1 shadow-xl">
            <video
              src="/videos/dashboard.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-auto w-full rounded-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
