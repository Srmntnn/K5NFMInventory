"use client";

import React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  User,
  Users,
  Database,
  Plus,
  ChevronRight,
  Building2,
  LocateFixedIcon,
  MapPin,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

import Logo from "@/assets/Logo.png";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Link } from "react-router-dom";

// Menu items.
const menu = [
  {
    title: "Dashboard",
    url: "/dashboard/home",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
];

const itemMenu = [
  {
    title: "Items",
    url: "#",
    icon: Database,
    isActive: true,
    items: [
      {
        title: "All Items",
        url: "all-items",
      },
      {
        title: "Add Item",
        url: "add-item",
      },
      {
        title: "Borrow Requests",
        url: "borrow-request",
      },
    ],
  },
  {
    title: "Brands",
    url: "#",
    icon: Building2,
    items: [
      {
        title: "All Brands",
        url: "brands",
      },
      {
        title: "Add Brands",
        url: "add-brands",
      },
    ],
  },
  {
    title: "Location",
    url: "#",
    icon: MapPin,
    items: [
      {
        title: "All Locations",
        url: "locations",
      },
      {
        title: "Add Location",
        url: "add-locations",
      },
    ],
  },
  {
    title: "Documentation",
    url: "#",
    icon: BookOpen,
    items: [
      {
        title: "Introduction",
        url: "#",
      },
      {
        title: "Get Started",
        url: "#",
      },
      {
        title: "Tutorials",
        url: "#",
      },
      {
        title: "Changelog",
        url: "#",
      },
    ],
  },
];

const dataMenu = {
  projects: [
    {
      name: "Add Items",
      url: "add-item",
    },
    {
      name: "Add Brands",
      url: "add-brands",
    },
    {
      name: "Add Locations",
      url: "add-locations",
    },
  ],
};

export function AppSidebar(props) {
  return (
    <Sidebar collapsible="icon" {...props} className="">
      <SidebarHeader>
        <div className="flex p-2 gap-2 items-center whitespace-nowrap">
          <div className="h-10 flex items-center justify-center">
            <Link to="/dashboard/home">
            <img src={Logo} alt="Logo" className="w-10" />
            
            </Link>
          </div>

          {/* Hide this text when collapsed to icon mode */}
          <div className="group-data-[collapsible=icon]:hidden transition-all">
            <h1 className="text-sm font-semibold">K5 News FM</h1>
            <p className="text-[12px]">Bacolod</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Home</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemMenu.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>

            {/* <SidebarMenu>
              {itemMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu> */}
          </SidebarGroupContent>
        </SidebarGroup>
        <NavProjects projects={dataMenu.projects} />
      </SidebarContent>

      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
