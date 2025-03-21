"use client";

import { PlusIcon } from "lucide-react";

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
import { useGetDiagrams } from "@/queries/diagram/useGetDiagrams";
import { diagramsToFront } from "@/lib/Parser/diagramsToFront";

export function NavDiagrams() {

  const diagramsData = useGetDiagrams();
  const navDiagrams = diagramsToFront(diagramsData.data ?? []);
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
        {navDiagrams.map((item) => (
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
