import { Footer } from '@/features/landing/Footer';

import { DocsSidebar } from './DocsSidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        <DocsSidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="container p-12">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
