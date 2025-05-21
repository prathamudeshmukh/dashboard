import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const FAQItem = ({ question, answer }: { question: string; answer: React.ReactNode }) => (
  <AccordionItem value={question}>
    <AccordionTrigger className="text-left text-2xl font-semibold">{question}</AccordionTrigger>
    <AccordionContent className="text-base font-normal">{answer}</AccordionContent>
  </AccordionItem>
);
