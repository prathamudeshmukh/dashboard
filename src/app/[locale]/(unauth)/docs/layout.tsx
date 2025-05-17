'use client';

import { ArrowLeft, Book, Code, FileText, LifeBuoy, Lock, Server, Shield, TriangleAlertIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Footer } from '@/features/landing/Footer';

const navItems = [
  {
    id: 'introduction',
    title: 'Introduction',
    icon: Book,
  },
  {
    id: 'authentication',
    title: 'Authentication',
    icon: Lock,
  },
  {
    id: 'api-endpoints',
    title: 'API Endpoints',
    icon: Server,
  },
  {
    id: 'request-response-examples',
    title: 'Request & Response Examples',
    icon: Code,
  },
  {
    id: 'error-handling',
    title: 'Error Handling',
    icon: TriangleAlertIcon,
  },
  {
    id: 'security-best-practices',
    title: 'Security & Best Practices',
    icon: Shield,
  },
  {
    id: 'contact-support',
    title: 'Contact & Support',
    icon: LifeBuoy,
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const router = useRouter();

  // Scroll Detection for Active Section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries.find(entry => entry.isIntersecting);
        if (visibleSection) {
          setActiveSection(visibleSection.target.id);
        }
      },
      { threshold: 0.5 }, // Trigger when 50% of the section is visible
    );

    navItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">

      <aside className="sticky top-0 hidden h-screen w-72 border-r lg:block">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center rounded-md p-2 hover:bg-muted"
          >
            <ArrowLeft className="size-5 text-muted-foreground" />
          </button>

          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FileText className="size-6 text-primary" />
            <span className="text-lg">Templify Docs</span>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
          <nav className="space-y-1">
            {navItems.map(item => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors 
                  ${
              activeSection === item.id
                ? 'bg-primary text-white'
                : 'hover:bg-muted'
              }`}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon
                  className={`size-4 ${
                    activeSection === item.id
                      ? 'text-white'
                      : 'text-muted-foreground'
                  }`}
                />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="container p-12">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
