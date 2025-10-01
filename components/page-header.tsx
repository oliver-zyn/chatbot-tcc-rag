"use client";

import { SidebarToggle } from "@/components/sidebar-toggle";

interface PageHeaderProps {
  title?: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-3">
        <SidebarToggle />
        {title && <h1 className="font-semibold text-lg">{title}</h1>}
      </div>
    </div>
  );
}
