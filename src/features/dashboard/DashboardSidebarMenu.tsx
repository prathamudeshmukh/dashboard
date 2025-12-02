'use client';

import { ChartColumn, ChevronsUpDown, Home, Key, Settings, Webhook } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SheetClose } from '@/components/ui/sheet';

const sidebarMenu = [
  {
    id: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    submenu: [
      {
        id: 'api-keys',
        href: '/dashboard/settings/api-keys',
        label: 'API Keys',
        icon: Key,
      },
      {
        id: 'webhooks',
        href: '/dashboard/settings/webhooks',
        label: 'Webhooks',
        icon: Webhook,
      },
    ],
  },
  {
    id: 'usage-metrics',
    href: '/dashboard/usage-metrics',
    label: 'Usage',
    icon: ChartColumn,
  },
];

export const DashboardSidebarMenu = () => {
  const pathname = usePathname();
  const activeLink: string | undefined = pathname.split('/').pop();
  const [active, setActive] = useState<string>(activeLink || 'dashboard');
  return (
    <div className="space-y-1 p-4 pt-0">
      {sidebarMenu.map(menu =>
        (
          <React.Fragment key={menu.id}>
            {menu.submenu
              ? (
                  <Collapsible className="space-y-1" defaultOpen={menu.submenu.some(sub => sub.id === active)}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-base outline-none hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <menu.icon
                          className={`size-5 ${active === menu.id
                            ? 'text-white'
                            : 'text-muted-foreground'
                          }`}
                        />
                        <span>{menu.label}</span>
                      </div>
                      <ChevronsUpDown className="size-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-1 pl-4">
                        {menu.submenu.map(sub =>
                          (
                            <SheetClose key={sub.id} asChild>
                              <Link
                                href={sub.href}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-base transition-colors 
                                  ${active === sub.id
                              ? 'bg-primary text-white'
                              : 'hover:bg-muted'
                            }`}
                                onClick={() => setActive(sub.id)}
                              >
                                <sub.icon
                                  className={`size-5 ${active === sub.id
                                    ? 'text-white'
                                    : 'text-muted-foreground'
                                  }`}
                                />
                                <span>{sub.label}</span>
                              </Link>
                            </SheetClose>
                          ),
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              : (
                  <SheetClose key={menu.id} asChild>
                    <Link
                      key={menu.label}
                      href={menu.href}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-base transition-colors 
                        ${active === menu.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-muted'
                  }`}
                      onClick={() => setActive(menu.id)}
                    >
                      <menu.icon
                        className={`size-5 ${active === menu.id
                          ? 'text-white'
                          : 'text-muted-foreground'
                        }`}
                      />
                      <span>{menu.label}</span>
                    </Link>
                  </SheetClose>
                )}
          </React.Fragment>
        ),
      )}
    </div>
  );
};
