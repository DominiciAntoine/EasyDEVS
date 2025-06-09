import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Link } from "react-router-dom";

export function ModelLinkWithPreviewHover({
  to,
  onDragStart,
  children,
  preview,
}: {
  to: string;
  onDragStart: (e: React.DragEvent) => void;
  children: React.ReactNode;
  preview: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Link
          draggable
          onDragStart={onDragStart}
          to={to}
          className="cursor-pointer"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          tabIndex={-1}
        >
          {children}
        </Link>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-80 pointer-events-none select-none"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {preview}
      </PopoverContent>
    </Popover>
  );
}
