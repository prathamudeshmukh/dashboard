import { UserButton } from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Logo } from '@/components/landing/Logo';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from '@/components/ui/sheet';

import { DashboardSidebarMenu } from './DashboardSidebarMenu';

export const DashboardSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu className="ml-8 size-8 cursor-pointer" />
      </SheetTrigger>

      <SheetContent>
        <SheetHeader className="border-b">
          <SheetClose asChild>
            <Link href="/dashboard" className="pl-2 max-sm:hidden">
              <Logo />
            </Link>
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
