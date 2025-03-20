import { Book, Code, FileText, LifeBuoy, Lock, Server, Shield, TriangleAlertIcon } from 'lucide-react';
import Link from 'next/link';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Footer } from '@/templates/Footer';

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

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">

      <aside className="sticky top-0 hidden h-screen w-72 border-r lg:block">
        <div className="flex h-16 items-center border-b px-6">
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
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <item.icon className="size-4 text-muted-foreground" />
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
