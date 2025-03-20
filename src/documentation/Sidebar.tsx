import { FileText } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

export const Sidebar = () => {
  const t = useTranslations('TemplifyDocSidebar');
  return (
    <aside className="hidden w-64 border-r lg:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="size-6" />
          <span>{t('templify_docs')}</span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
        <nav className="space-y-2">
          <Link href="#introduction" className="block py-2 text-sm hover:underline">
            {t('introduction')}
          </Link>
          <Link href="#authentication" className="block py-2 text-sm hover:underline">
            {t('authentication')}
          </Link>
          <Link href="#api-endpoints" className="block py-2 text-sm hover:underline">
            {t('api_endpoint')}
          </Link>
          <Link href="#request-response-examples" className="block py-2 text-sm hover:underline">
            {t('request_response')}
          </Link>
          <Link href="#error-handling" className="block py-2 text-sm hover:underline">
            {t('error_handling')}
          </Link>
          <Link href="#security-best-practices" className="block py-2 text-sm hover:underline">
            {t('security')}
          </Link>
          <Link href="#contact-support" className="block py-2 text-sm hover:underline">
            {t('contact')}
          </Link>
        </nav>
      </ScrollArea>
    </aside>
  );
};
