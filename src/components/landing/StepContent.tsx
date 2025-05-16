'use client';

import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type StepContentProps = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  innerRef: (el: HTMLDivElement | null) => void;
};

export default function StepContent({
  id,
  title,
  description,
  image,
  imageAlt,
  innerRef,
}: StepContentProps) {
  return (
    <div
      id={`step-${id}`}
      ref={innerRef}
      className="w-full scroll-mt-24 rounded-xl border border-secondary/20 bg-primary/30 p-6"
    >
      <div className="flex flex-col justify-between gap-8 md:flex-row">
        {/* Left column: Title + Try Now button */}
        <div className="flex w-full flex-col justify-between md:w-1/3">
          <h3 className="text-2xl font-bold">{title}</h3>
          <Link href="#" className="mt-8 flex items-center font-medium text-secondary md:mt-0">
            Try Now
            {' '}
            <ChevronRight className="ml-1 size-4" />
          </Link>
        </div>

        {/* Right column: Description + Image */}
        <div className="flex w-full flex-col justify-start space-y-12 md:w-2/3">
          <p className="mb-6">{description}</p>
          <div>
            <Image
              src={image}
              alt={imageAlt}
              width={476}
              height={295}
              className="w-full rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
