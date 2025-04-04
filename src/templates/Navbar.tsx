'use client';

import { ClerkProvider, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { CenteredMenu } from '@/features/landing/CenteredMenu';
import type { NavbarProps } from '@/types/Navbar';

import { Logo } from './Logo';

export const Navbar = ({ menuList, basePath = ' ' }: NavbarProps) => {
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

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
          {menuList.map((item, index) => {
            const linkHref = isLandingPage ? item.link : `${basePath}${item.link.replace('#', '/')}`;

            return (
              <li key={index}>
                <Link href={linkHref}>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </CenteredMenu>
      </section>
    </header>
  );
};
