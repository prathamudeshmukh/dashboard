import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const FAQItem = ({ question, answer, onClick }: { question: string; answer: React.ReactNode; onClick: () => void }) => (
  <AccordionItem value={question}>
    <AccordionTrigger onClick={onClick} className="text-left text-2xl font-semibold">{question}</AccordionTrigger>
    <AccordionContent className="text-base font-normal">{answer}</AccordionContent>
  </AccordionItem>
);
