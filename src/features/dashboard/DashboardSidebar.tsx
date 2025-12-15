'use client';

import { UserButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Logo } from '@/components/landing/Logo';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { DashboardSidebarMenu } from './DashboardSidebarMenu';

export const DashboardSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open sidebar menu"
          className="ml-8 block cursor-pointer"
        >
          <Menu className="size-8" />
        </button>
      </SheetTrigger>

      <SheetContent>
        <SheetTitle className="sr-only">Sidebar Menu</SheetTitle>
        <SheetHeader className="relative items-center border-b px-7">
          <SheetClose asChild>
            <Link href="/">
              <Logo />
            </Link>
          </SheetClose>

          <SheetClose>
            <X className="focus:outline-hidden absolute right-4 top-1/2 size-4 -translate-y-1/2 rounded-sm border-none opacity-70 outline-none transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-secondary" />
          </SheetClose>
        </SheetHeader>

        <DashboardSidebarMenu />

        <SheetFooter className="border-t px-5">
          <UserButton
            userProfileMode="navigation"
            userProfileUrl="/dashboard/user-profile"
            appearance={{
              elements: {
                rootBox: 'px-2 py-1.5',
                userButtonTrigger: 'focus:shadow-none focus:outline-none',
                userButtonBox: 'flex-row-reverse',
                userButtonOuterIdentifier: 'text-base font-medium pl-0',
              },
            }}
            showName
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
