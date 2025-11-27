'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Logo } from '@/components/landing/Logo';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { DashboardSidebarMenu } from './DashboardSidebarMenu';

export const DashboardSidebar = () => {
  const { user } = useUser();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu className="ml-8 size-8 cursor-pointer" />
      </SheetTrigger>

      <SheetContent>
        <SheetTitle className="sr-only">Sidebar Menu</SheetTitle>
        <SheetHeader className="relative items-center justify-center border-b">
          <SheetClose asChild>
            <Link href="/dashboard">
              <Logo />
            </Link>
          </SheetClose>

          <SheetClose>
            <X className="focus:outline-hidden absolute right-4 top-1/2 size-4 -translate-y-1/2 rounded-sm border-none opacity-70 outline-none transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-secondary" />
          </SheetClose>
        </SheetHeader>

        <DashboardSidebarMenu />

        <SheetFooter className="border-t">
          <UserButton
            userProfileMode="navigation"
            userProfileUrl="/dashboard/user-profile"
            appearance={{
              elements: {
                rootBox: 'px-2 py-1.5',
              },
            }}
          />
          <span className="text-base font-medium">{user?.fullName}</span>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
