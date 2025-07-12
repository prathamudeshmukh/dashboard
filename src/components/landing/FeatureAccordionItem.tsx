import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { FeatureAccordionItemProps } from '@/types/Features';

export function FeatureAccordionItem({ value, title, description, points }: FeatureAccordionItemProps) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="text-left text-2xl font-medium text-primary">{title}</AccordionTrigger>
      <AccordionContent>
        <p className="mb-4 text-base font-normal text-gray-600">{description}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {points?.map((point, index) => (
            <li key={index}>
              {point}
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
