"use client";

import type { ComponentProps } from "react";
import { PanelLeft } from "lucide-react";

import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn("h-8 w-8 p-0 md:h-8 md:w-8", className)}
          onClick={toggleSidebar}
          variant="ghost"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">
        Toggle Sidebar
      </TooltipContent>
    </Tooltip>
  );
}
