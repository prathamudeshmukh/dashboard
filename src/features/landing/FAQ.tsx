import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FAQItem } from '@/components/landing/FAQItem';
import { Section } from '@/components/landing/Section';
import { Accordion } from '@/components/ui/accordion';

export const FAQ = () => {
  const t = useTranslations('FAQ');

  const faqs = [
    {
      question: t('question_1'),
      answer: t('answer_1'),
    },
    {
      question: t('question_2'),
      answer: t('answer_2'),
    },
    {
      question: t('question_3'),
      answer: (
        <>
          <span>{t('answer_3.1')}</span>
          <ul className="mt-2 list-disc pl-6">
            <li>{t('answer_3.2')}</li>
            <li>{t('answer_3.3')}</li>
          </ul>
        </>
      ),
    },
    {
      question: t('question_4'),
      answer: t('answer_4'),
    },
    {
      question: t('question_5'),
      answer: t('answer_5'),
    },
    {
      question: t('question_6'),
      answer: t('answer_6'),
    },
    {
      question: t('question_7'),
      answer: t('answer_7'),
    },
  ];

  return (
    <div id="faq">
      <Section
        title={t('title')}
        icon={FileText}
      >
        <div className="container px-4 md:px-6">
          <div className="mx-auto mt-8 max-w-3xl space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </Accordion>
          </div>
        </div>
      </Section>
    </div>

  );
};
