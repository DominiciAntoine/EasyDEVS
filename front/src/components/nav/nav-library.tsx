"use client";

import {
  ChevronRight,
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
import { Link, useNavigate } from "react-router-dom";
import { useGetLibraries } from "@/queries/library/useGetLibraries";
import { useGetModels } from "@/queries/model/useGetModels";
import { librairiesToFront } from "@/lib/Parser/librairiesToFront";
import { LibraryDeleteDialog } from "@/modals/library/LibraryDeleteDialog";
import { ModelDeleteDialog } from "@/modals/model/ModelDeleteDialog";

export function NavLibrary() 
{
  //a voir avec dorian si on met ca dans ce composant ou le composant parent
  const libraries = useGetLibraries();
  const models = useGetModels();

  const navigate = useNavigate()

  const navLibraries = librairiesToFront(libraries.data ?? [], models.data ?? []);


  return (
    <SidebarGroup>
        <ContextMenu>
          <ContextMenuTrigger>
          <SidebarGroupLabel className="flex justify-between items-center w-full pl-2 pr-1">
            <span>Library</span>

            <Button asChild variant={"ghost"} size={"sm"} className="h-6 w-6">
              <Link to={"/library/new"}>
                <PlusIcon />
              </Link>
            </Button>
          </SidebarGroupLabel>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
            <Link to={"/library/new"}>New library</Link>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>


      <SidebarMenu>
        {navLibraries.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <ContextMenu modal={false}>
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
                    <Link to={"/library/" + item.id + "/model/new"}>New model...</Link>
                  </ContextMenuItem>
                  {item.id ? (
                    <LibraryDeleteDialog
                    libraryId={item.id}
                    libraryName={item.title}
                    onSubmitSuccess={async () => {
                      await libraries.mutate()
                      navigate("/");
                    }}
                    disclosure={
                      <ContextMenuItem onSelect={e => e.preventDefault()}>
                          Delete
                      </ContextMenuItem>
                      }
                    />
                  ) : null}
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
                        <Link to={"/library/" + item.id + "/model/" + subItem.id}>Edit</Link>
                        </ContextMenuItem>
                        {subItem.id ? (
                    <ModelDeleteDialog
                    modelId={subItem.id}
                    modelName={subItem.title}
                    onSubmitSuccess={async () => {
                      await models.mutate()
                      navigate("/");
                    }}
                    disclosure={
                      <ContextMenuItem onSelect={e => e.preventDefault()}>
                          Delete
                      </ContextMenuItem>
                      }
                    />
                  ) : null}
                        
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
