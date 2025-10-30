"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Plus,
  FolderOpen,
  Upload,
  Library,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { NavUser } from "@/components/nav-user";
import { ConversationItem } from "@/components/conversation-item";
import { SearchForm } from "@/components/search-form";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { ConversationWithLastMessage } from "@/lib/db/queries/conversations";
import { groupConversationsByDate } from "@/lib/utils/date";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  conversations: ConversationWithLastMessage[];
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export function AppSidebar({
  user,
  conversations,
  onNewConversation,
  onDeleteConversation,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const [isCreating, setIsCreating] = React.useState(false);

  const groupedConversations = React.useMemo(
    () => groupConversationsByDate(conversations),
    [conversations]
  );

  const handleNewConversation = async () => {
    setIsCreating(true);
    try {
      await onNewConversation();
    } finally {
      setIsCreating(false);
    }
  };

  const navDocuments = [
    {
      title: "Upload",
      url: "/documents",
      icon: Upload,
      isActive: pathname === "/documents",
    },
    {
      title: "Biblioteca",
      url: "/documents/library",
      icon: Library,
      isActive: pathname === "/documents/library",
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Brain className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Synapse</span>
                  <span className="text-xs">RAG System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="mt-2">
            <SidebarMenuButton
              onClick={handleNewConversation}
              disabled={isCreating}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{isCreating ? "Criando..." : "Nova conversa"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SearchForm conversations={conversations} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <FolderOpen className="mr-2 h-4 w-4 inline" />
            Documentos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navDocuments.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {conversations.length === 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>
              <MessageSquare className="mr-2 h-4 w-4 inline" />
              Conversas
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-sidebar-accent">
                  <MessageSquare className="h-6 w-6 text-sidebar-accent-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Nenhuma conversa ainda.
                  <br />
                  Clique em &quot;Nova conversa&quot; para começar.
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <AnimatePresence mode="popLayout">
            {groupedConversations.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.conversations.map((conversation) => {
                      const isActive = pathname === `/chat/${conversation.id}`;
                      return (
                        <ConversationItem
                          key={conversation.id}
                          conversation={conversation}
                          isActive={isActive}
                          onDelete={onDeleteConversation}
                        />
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </AnimatePresence>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
