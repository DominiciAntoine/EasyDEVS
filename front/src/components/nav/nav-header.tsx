import React from "react";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarTrigger } from "../ui/sidebar";
import { NavActions } from "./nav-actions";

type NavHeaderProps = {
  breadcrumbs: {
    label: string;
    href?: string;
  }[];
  showNavActions?: boolean;
  showModeToggle?: boolean;
  headerBgClass?: string;
  headerExtraClass?: string;
};

const NavHeader: React.FC<NavHeaderProps> = ({
  breadcrumbs,
  showNavActions = true,
  showModeToggle = true,
  headerBgClass = "bg-background",
  headerExtraClass = "",
}) => {
  const lastIndex = breadcrumbs.length - 1;

  return (
    <header
      className={`flex sticky top-0 ${headerBgClass} h-16 shrink-0 items-center gap-2 border-b px-4 ${headerExtraClass}`}
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem className={index < lastIndex ? "hidden md:block" : ""}>
                {index < lastIndex && item.href ? (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < lastIndex && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto px-3 flex items-center gap-2">
        {showNavActions && <NavActions />}
        {showModeToggle && <ModeToggle />}
      </div>
    </header>
  );
};

export default NavHeader;
