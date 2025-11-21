import { Footer } from '@/features/landing/Footer';

import { DocsSidebar } from './DocsSidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        <DocsSidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="container p-12 lg:pb-56">
            {children}
          </div>
        </main>
      </div>
      <div className="w-full lg:fixed lg:bottom-0">
        <Footer />
      </div>
    </div>
  );
}
