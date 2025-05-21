import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type FeatureAccordionItemProps = {
  value: string;
  title: string;
  description: string;
};

export function FeatureAccordionItem({ value, title, description }: FeatureAccordionItemProps) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="text-left text-2xl font-medium text-primary">{title}</AccordionTrigger>
      <AccordionContent>
        <p className="mb-4 text-base font-normal text-gray-600">{description}</p>
      </AccordionContent>
    </AccordionItem>
  );
}
