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
      className="scroll-mt-24 rounded-xl border border-white/20 bg-primary/30 p-8"
    >
      <h3 className="mb-4 text-2xl font-bold">{title}</h3>
      <p className="mb-6">{description}</p>
      <div className="mt-4 rounded-lg bg-white p-4">
        <Image src={image} alt={imageAlt} width={476} height={295} className="w-full" />
      </div>
      <div className="mt-8">
        <Link href="#" className="flex items-center font-medium text-white">
          Try Now
          {' '}
          <ChevronRight className="ml-1 size-4" />
        </Link>
      </div>
    </div>
  );
}
