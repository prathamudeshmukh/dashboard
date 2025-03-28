import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const FAQItem = ({ question, answer }: { question: string; answer: React.ReactNode }) => (
  <AccordionItem value={question}>
    <AccordionTrigger className="text-left font-medium">{question}</AccordionTrigger>
    <AccordionContent>{answer}</AccordionContent>
  </AccordionItem>
);
