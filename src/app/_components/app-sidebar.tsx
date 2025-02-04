"use client";

import {
  Building,
  Building2,
  CalendarFold,
  CalendarPlus,
  Home,
  NotebookPen,
  NotebookText,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./ui/sidebar";
import Link from "next/link";
import { useParams } from "next/navigation";
import If from "./ui/if";

const sidebarItems = [
  {
    title: "Profile",
    icon: User,
    href: "/settings/profile",
  },
  {
    title: "Companies",
    icon: Building2,
    href: "/settings/company",
    subItems: [
      {
        title: "New Company",
        href: () => `/settings/company/new-company`,
        icon: Building,
      },
      {
        title: "Events",
        icon: CalendarFold,
        href: (companyId: string) => `/settings/company/${companyId}/events`,
      },
      {
        title: "New Event",
        icon: CalendarPlus,
        href: (companyId: string) =>
          `/settings/company/${companyId}/events/new-event`,
      },
      {
        title: "Posts",
        icon: NotebookText,
        href: (companyId: string) => `/settings/company/${companyId}/posts`,
      },
      {
        title: "New Post",
        icon: NotebookPen,
        href: (companyId: string) =>
          `/settings/company/${companyId}/posts/new-post`,
      },
    ],
  },
  {
    title: "Go Home",
    icon: Home,
    href: "/",
  },
];

export default function AppSidebar() {
  const params = useParams<{ companyId: string }>();

  return (
    <Sidebar childrenClassName="rounded-l-2xl">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <If condition={Array.isArray(item.subItems)}>
                      {item.subItems!.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            href={subItem.href(params.companyId)}
                          >
                            <subItem.icon className="mr-2 h-4 w-4" />
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </If>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
