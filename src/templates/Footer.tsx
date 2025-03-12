import { FileText } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export const Footer = () => {
  const t = useTranslations('Footer');

  return (
    <footer className="w-full border-t bg-background px-14 py-6 md:py-12">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
        <div className="flex items-center gap-2 text-lg font-bold">
          <FileText className="size-5 text-primary" />
          <span>Templify</span>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:underline">
            {t('privacy_policy')}
          </Link>
          <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:underline">
            {t('terms_of_service')}
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:underline">
            {t('contact')}
          </Link>
        </nav>
        <div className="flex-1 text-center text-sm text-muted-foreground md:text-right">
          ©
          {' '}
          {new Date().getFullYear()}
          {' '}
          {t('rights')}
        </div>
      </div>
    </footer>
  );
};
