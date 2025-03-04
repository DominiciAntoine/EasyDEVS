"use client";

import { type LucideIcon, PlusIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { Button } from "../ui/button";

import { Link } from "react-router-dom";

export function NavDiagrams({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <ContextMenu>
        <ContextMenuTrigger>
          <SidebarGroupLabel className="flex justify-between items-center w-full pl-2 pr-1">
            <span>Diagrams</span>

            <Button asChild variant={"ghost"} size={"sm"} className="h-6 w-6">
              <Link to={"#add_diagram"}>
                <PlusIcon />
              </Link>
            </Button>
          </SidebarGroupLabel>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            <a href={"#add_diagram_"}>Add...</a>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <SidebarMenu>
        {projects.map((item) => (
          <ContextMenu key={item.name}>
            <ContextMenuTrigger>
              <SidebarMenuItem >
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>
                <a href={"#delete_diagram_" + item.name}>Delete</a>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
