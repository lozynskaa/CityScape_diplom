"use client";

import {
  Building,
  Building2,
  CalendarFold,
  CalendarPlus,
  NotebookPen,
  NotebookText,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./ui/sidebar";
import Link from "next/link";
import { useParams } from "next/navigation";

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
];

export default function AppSidebar() {
  const params = useParams<{ companyId: string }>();

  return (
    <Sidebar>
      <SidebarContent>
        {sidebarItems.map((item) => (
          <SidebarMenuItem key={item.title} title={item.title}>
            <Link href={item.href}>
              <SidebarMenuButton>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </SidebarMenuButton>
            </Link>
            {item.subItems?.length &&
              item.subItems.map((subItem) => (
                <SidebarMenuSub key={subItem.title}>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href={subItem.href(params.companyId)}>
                      <subItem.icon className="mr-2 h-4 w-4" />
                      {subItem.title}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              ))}
          </SidebarMenuItem>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
