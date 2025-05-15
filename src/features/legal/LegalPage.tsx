'use client';

import { format } from 'date-fns';
import { Mail } from 'lucide-react';

import { Footer } from '@/features/landing/Footer';
import { Navbar } from '@/features/landing/Navbar';

type Section = {
  id: string;
  title: string;
  content: string | JSX.Element;
};

type LegalPageProps = {
  title: string;
  lastUpdated?: Date;
  sections: Section[];
  contactEmail?: string;
};
const DEFAULT_LAST_UPDATED = new Date();

export default function LegalPage({
  title,
  lastUpdated = DEFAULT_LAST_UPDATED,
  sections,
  contactEmail,
}: LegalPageProps) {
  const menuList = [
    { link: '##features', name: 'Feature' },
    { link: '##how-it-works', name: 'How it Works' },
    { link: '##pricing', name: 'Pricing' },
    { link: '##security', name: 'Security' },
    { link: 'docs', name: 'Docs' },
  ];
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar menuList={menuList} basePath="/" />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="space-y-8">

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground">
                Last Updated:
                {format(lastUpdated, 'MMMM d, yyyy')}
              </p>
            </div>

            {sections.map(section => (
              <section key={section.id} className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight" id={section.id}>
                  {section.title}
                </h2>
                {typeof section.content === 'string' ? <p className="leading-7">{section.content}</p> : section.content}
              </section>
            ))}

            {contactEmail && (
              <section className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight" id="contact">Contact</h2>
                <p className="leading-7">
                  For any questions, contact us at
                  {' '}
                  <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-1 text-primary underline underline-offset-4">
                    <Mail className="size-4" />
                    {contactEmail}
                  </a>
                </p>
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
