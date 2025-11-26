import { UserButton } from '@clerk/nextjs';
import { ChartColumn, Home, Key, Settings, Webhook } from 'lucide-react';
import Link from 'next/link';

import { Logo } from '@/components/landing/Logo';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail } from '@/components/ui/sidebar';

const sidebarMenu = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: Home,
  },
  {
    label: 'Settings',
    icon: Settings,
    submenu: [
      {
        href: '/dashboard/settings/api-keys',
        label: 'API Keys',
        icon: Key,
      },
      {
        href: '/dashboard/settings/webhooks',
        label: 'Webhooks',
        icon: Webhook,
      },
    ],
  },
  {
    href: '/dashboard/usage-metrics',
    label: 'Usage',
    icon: ChartColumn,
  },
];

export const DashboardSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="max-sm:hidden">
          <Logo />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarMenu.map((menu) => {
                const Icon = menu.icon;

                return (
                  <SidebarMenuItem key={menu.label}>
                    {menu.submenu
                      ? (
                          <>
                            <SidebarMenuButton>
                              <Icon className="mr-2 size-4" />
                              <span>{menu.label}</span>
                            </SidebarMenuButton>

                            <SidebarMenuSub>
                              {menu.submenu.map((sub) => {
                                const SubIcon = sub.icon;

                                return (
                                  <SidebarMenuSubItem key={sub.label}>
                                    <SidebarMenuSubButton asChild>
                                      <Link href={sub.href}>
                                        <SubIcon className="mr-2 size-4" />
                                        <span>{sub.label}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </>
                        )
                      : (
                          <SidebarMenuButton asChild>
                            <Link href={menu.href}>
                              <Icon className="mr-2 size-4" />
                              <span>{menu.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserButton
          userProfileMode="navigation"
          userProfileUrl="/dashboard/user-profile"
          appearance={{
            elements: {
              rootBox: 'px-2 py-1.5',
            },
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
