'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Check, Mail, X } from 'lucide-react';
import { SUPPORT_EMAIL } from 'templify.constants';

import type { PricingPlan } from '@/components/landing/PricingCard';
import { Button } from '@/components/ui/button';

type PlanContactDialogProps = {
  plan: PricingPlan | null;
  open: boolean;
  onClose: () => void;
};

function buildMailtoHref(plan: PricingPlan): string {
  const priceLabel = typeof plan.price === 'number' ? `$${plan.price}/month` : plan.price;
  const subject = encodeURIComponent(`Interested in the ${plan.name} plan – Templify`);
  const body = encodeURIComponent(
    `Hi,\n\nI'd like to get started with the ${plan.name} plan (${priceLabel}).\n\nPlease let me know the next steps.\n\nThanks`,
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

export function PlanContactDialog({ plan, open, onClose }: PlanContactDialogProps): React.ReactElement | null {
  if (!plan) {
    return null;
  }

  const priceDisplay = typeof plan.price === 'number' ? `$${plan.price}` : plan.price;

  return (
    <Dialog.Root open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-2xl duration-200 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {/* Dialog.Close triggers onOpenChange(false) → onClose via the root handler */}
          <Dialog.Close
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="size-4" />
          </Dialog.Close>

          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              {plan.name}
              {' '}
              Plan
            </span>
          </div>

          <Dialog.Title className="text-3xl font-bold text-gray-900">
            {priceDisplay}
            {typeof plan.price === 'number' && (
              <span className="ml-1 text-base font-normal text-gray-500">/ month</span>
            )}
          </Dialog.Title>

          <Dialog.Description className="mt-3 text-gray-600">
            Self-serve plan activation is on the way. Until then, email us and we&apos;ll get you set up — usually within a few hours.
          </Dialog.Description>

          <ul className="mt-5 space-y-2">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="mt-0.5 size-4 shrink-0 text-green-500" />
                {feature.text}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col gap-3">
            <a href={buildMailtoHref(plan)} onClick={onClose}>
              <Button className="w-full rounded-full bg-primary py-3 text-base font-medium text-white hover:bg-primary">
                <Mail className="mr-2 size-4" />
                Send us an email
              </Button>
            </a>

            <p className="text-center text-xs text-gray-400">
              Or copy our address:
              {' '}
              <span className="select-all font-medium text-gray-600">{SUPPORT_EMAIL}</span>
            </p>

            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-400 underline-offset-2 hover:underline"
            >
              Maybe later
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
