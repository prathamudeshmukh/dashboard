'use client';

import { SignOutButton, SignUpButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { CenteredMenu } from '@/components/landing/CenteredMenu';
import { Button } from '@/components/ui/button';
import type { NavbarProps } from '@/types/Navbar';

import { Logo } from '../../components/landing/Logo';

export const Navbar = ({ menuList, basePath = ' ' }: NavbarProps) => {
  const { isSignedIn } = useUser();
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-primary-foreground py-4">
        <section className="container mx-auto px-4">
          <CenteredMenu
            logo={<Logo />}
            rightMenu={(
              <li>
                {isSignedIn
                  ? (
                      <div className="flex items-center space-x-4">
                        <SignOutButton>
                          <Button variant="outline" className="rounded-full border-black text-sm">{t('sign_out')}</Button>
                        </SignOutButton>
                        <Link href="/dashboard">
                          <Button className="rounded-full bg-primary text-sm hover:bg-primary">{t('dashboard')}</Button>
                        </Link>
                      </div>
                    )
                  : (
                      <div className="flex items-center space-x-4">
                        <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                          <Button variant="outline" className="rounded-full border-black text-sm ">
                            {t('sign_up')}
                          </Button>
                        </SignUpButton>
                        <Link href="/sign-in">
                          <Button className="rounded-full bg-primary text-sm hover:bg-primary">
                            Start free trial
                          </Button>
                        </Link>
                      </div>
                    )}
              </li>
            )}
          >
            <div className="hidden items-center space-x-8 md:flex">
              {menuList.map((item, index) => {
                const linkHref = isLandingPage ? item.link : `${basePath}${item.link.replace('#', '/')}`;

                return (
                  <li key={index}>
                    <Link
                      className="text-sm font-normal text-black hover:text-primary"
                      href={linkHref}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </div>
          </CenteredMenu>
        </section>
      </header>
    </>
  );
};
