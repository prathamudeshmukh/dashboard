'use client';

import Image from 'next/image';
import type React from 'react';

import type { StepContent as StepContentType } from '@/types/Steps';

import StepDescription from './StepDescription';

type StepContentProps = {
  content: StepContentType;
  innerRef: (el: HTMLDivElement | null) => void;
};

export default function StepContent({
  content,
  innerRef,
}: StepContentProps) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-primary via-templify-navy to-templify-blue p-px">
      <div className="rounded-xl bg-gradient-to-l from-primary via-templify-navy to-templify-blue p-px">
        <div
          id={`step-${content.id}`}
          ref={innerRef}
          className="w-full scroll-mt-24 rounded-xl bg-templify-cardBg p-6"
        >
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            {/* Left column: Title + Try Now button */}
            <div className="flex w-full flex-col justify-between md:w-1/3">
              <h3 className="text-2xl font-semibold">{content.title}</h3>
            </div>

            {/* Right column: Description + Image */}
            <div className="flex w-full flex-col justify-start space-y-8 md:w-2/3">
              <StepDescription content={content} />
              <div>
                {content.media.type === 'image' && (
                  <Image
                    src={content.media.src}
                    alt={content.media.alt}
                    width={476}
                    height={295}
                    className="w-full rounded-md"
                    priority={content.id === 'choose-how-to-start'}
                  />
                )}

                {content.media.type === 'video' && (

                  <video
                    width="100%"
                    controls={false}
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src={content.media.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
