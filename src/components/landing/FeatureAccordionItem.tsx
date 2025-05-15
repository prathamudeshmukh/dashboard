import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type FeatureAccordionItemProps = {
  value: string;
  title: string;
  description: string;
};

export function FeatureAccordionItem({ value, title, description }: FeatureAccordionItemProps) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="text-left text-xl font-bold text-primary">{title}</AccordionTrigger>
      <AccordionContent className="mt-2">
        <p className="mb-4 text-gray-600">{description}</p>
      </AccordionContent>
    </AccordionItem>
  );
}
