import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredMenu } from '@/features/landing/CenteredMenu';

import { Logo } from './Logo';

export const Navbar = () => {
  const t = useTranslations('Navbar');

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <section className="px-12 py-6">
        <CenteredMenu
          logo={<Logo />}
          rightMenu={(
            <>
              <li className="ml-1 mr-2.5" data-fade>
                <Link className={buttonVariants({ size: 'sm', variant: 'outline' })} href="/sign-in">{t('sign_in')}</Link>
              </li>
              <li>
                <Link className={buttonVariants({ size: 'sm' })} href="/sign-up">
                  {t('sign_up')}
                </Link>
              </li>
            </>
          )}
        >
          <li>
            <Link href="#features">Feature</Link>
          </li>

          <li>
            <Link href="#how-it-works">How it Works</Link>
          </li>

          <li>
            <Link href="#security">Security</Link>
          </li>

        </CenteredMenu>
      </section>
    </header>
  );
};
