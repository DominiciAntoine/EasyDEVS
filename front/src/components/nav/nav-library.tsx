"use client";

import {
  ChevronRight,
  type LucideIcon,
  PlusIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { DropdownMenu } from "@/components/ui/dropdown-menu";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "../ui/context-menu";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export function NavLibrary({
  items,
}: {
  items: {
    title: string;
    url: string;
    isActive?: boolean;
    items?: {
      icon?: LucideIcon;
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
        <ContextMenu>
          <ContextMenuTrigger>
          <SidebarGroupLabel className="flex justify-between items-center w-full pl-2 pr-1">
            <span>Library</span>

            <Button asChild variant={"ghost"} size={"sm"} className="h-6 w-6">
              <Link to={"#add_library"}>
                <PlusIcon />
              </Link>
            </Button>
          </SidebarGroupLabel>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <a href="#new_lib">New library</a>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>


      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <ContextMenu>
                <ContextMenuTrigger>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>
                    <a href={"#new_model_in_lib_" + item.title}>New model...</a>
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <a href={"#delete_lib_" + item.title}>Delete</a>
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem>
                    <a href={"#share_lib_" + item.title}>Share</a>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <DropdownMenu key={subItem.title}>
                      <ContextMenu>
                      <ContextMenuTrigger>
                      <SidebarMenuSubItem className="relative z-10">
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem>
                          <a href={"#edit_model_" + subItem.title}>Edit</a>
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <a href={"#delete_model_" + subItem.title}>Delete model</a>
                        </ContextMenuItem>
                        
                      </ContextMenuContent>
              </ContextMenu>
                    </DropdownMenu>
                  ))}
                  
                  
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>

          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
