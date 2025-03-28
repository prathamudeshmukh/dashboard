import { ClerkProvider, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
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
            <ClerkProvider>
              <li className="ml-1 mr-2.5" data-fade>
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <Button size="sm" variant="outline">{t('sign_in')}</Button>
                </SignInButton>
              </li>
              <li>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <Button size="sm">{t('sign_up')}</Button>
                </SignUpButton>
              </li>
            </ClerkProvider>
          )}
        >
          <li>
            <Link href="#features">Feature</Link>
          </li>

          <li>
            <Link href="#how-it-works">How it Works</Link>
          </li>

          <li>
            <Link href="#pricing">Pricing</Link>
          </li>

          <li>
            <Link href="#security">Security</Link>
          </li>

          <li>
            <Link href="/docs">Docs</Link>
          </li>

        </CenteredMenu>
      </section>
    </header>
  );
};
