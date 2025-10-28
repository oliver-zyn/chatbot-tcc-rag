"use client";

import * as React from "react";
import { Search } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ConversationSearchDialog } from "@/components/conversation-search-dialog";
import type { ConversationWithLastMessage } from "@/lib/db/queries/conversations";

interface SearchFormProps {
  conversations?: ConversationWithLastMessage[];
}

export function SearchForm({ conversations = [] }: SearchFormProps) {
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setSearchOpen(true)}
            className="border border-sidebar-border bg-sidebar-accent/50 hover:bg-sidebar-accent"
          >
            <Search className="h-4 w-4" />
            <span>Buscar conversas...</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <ConversationSearchDialog
        conversations={conversations}
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </>
  );
}
