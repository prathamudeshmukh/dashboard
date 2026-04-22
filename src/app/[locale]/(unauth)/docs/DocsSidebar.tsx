'use client';

import { ArrowLeft, Book, BookOpen, Box, Code, LifeBuoy, Lock, Menu, Server, Shield, TriangleAlertIcon, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Logo } from '@/components/landing/Logo';
import { ScrollArea } from '@/components/ui/scroll-area';

type NavItem =
  | { id: string; title: string; icon: React.ElementType; href?: undefined }
  | { id: string; title: string; icon: React.ElementType; href: string };

const navItems: NavItem[] = [
  { id: 'introduction', title: 'Introduction', icon: Book },
  { id: 'authentication', title: 'Authentication', icon: Lock },
  { id: 'api-endpoints', title: 'API Endpoints', icon: Server },
  { id: 'request-response-examples', title: 'Request & Response Examples', icon: Code },
  { id: 'template-versioning', title: 'Template Versioning', icon: Box },
  { id: 'error-handling', title: 'Error Handling', icon: TriangleAlertIcon },
  { id: 'security-best-practices', title: 'Security & Best Practices', icon: Shield },
  { id: 'contact-support', title: 'Contact & Support', icon: LifeBuoy },
  { id: 'api-reference', title: 'API Reference', icon: BookOpen, href: 'api-reference' },
];

function NavList({
  activeSection,
  docsBase,
  onNavigate,
}: {
  activeSection: string;
  docsBase: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <nav className="space-y-1">
      {navItems.map(item => (
        <Link
          key={item.id}
          href={item.href ? `${docsBase}/${item.href}` : `${docsBase}#${item.id}`}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors
            ${activeSection === item.id ? 'bg-primary text-white' : 'hover:bg-muted'}`}
          onClick={() => onNavigate(item.id)}
        >
          <item.icon
            className={`size-4 ${activeSection === item.id ? 'text-white' : 'text-muted-foreground'}`}
          />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
}

function SidebarHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-16 items-center gap-2 border-b px-4">
      <button
        onClick={onBack}
        className="flex items-center justify-center rounded-md p-2 hover:bg-muted"
        aria-label="Go back"
      >
        <ArrowLeft className="size-5 text-muted-foreground" />
      </button>
      <Link href="/" className="flex items-center">
        <Logo />
      </Link>
    </div>
  );
}

export function DocsSidebar() {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const docsBase = pathname.replace(/\/api-reference$/, '').replace(/\/$/, '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries.find(entry => entry.isIntersecting);
        if (visibleSection) {
          setActiveSection(visibleSection.target.id);
        }
      },
      { threshold: 0.5 },
    );

    navItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleNavigate = (id: string) => {
    setActiveSection(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center rounded-md p-2 hover:bg-muted"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r lg:block">
        <SidebarHeader onBack={() => router.back()} />
        <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
          <NavList
            activeSection={activeSection}
            docsBase={docsBase}
            onNavigate={handleNavigate}
          />
        </ScrollArea>
      </aside>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-background shadow-xl transition-transform duration-300 lg:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Navigation"
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center rounded-md p-2 hover:bg-muted"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>
        <ScrollArea className="h-[calc(100vh-3.5rem)] px-4 py-6">
          <NavList
            activeSection={activeSection}
            docsBase={docsBase}
            onNavigate={handleNavigate}
          />
        </ScrollArea>
      </aside>
    </>
  );
}
