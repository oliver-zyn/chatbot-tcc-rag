"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, MessageSquare, FileUp, Plus, Upload, Library, Sparkles, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { NavUser } from "@/components/nav-user";
import { ConversationItem } from "@/components/conversation-item";
import { ConversationSearchDialog } from "@/components/conversation-search-dialog";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import type { ConversationWithLastMessage } from "@/lib/db/queries/conversations";
import { groupConversationsByDate } from "@/lib/utils/date-grouping";

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
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { isMobile } = useSidebar();

  const navMain = [
    {
      title: "Conversas",
      url: "/",
      icon: MessageSquare,
      isActive: !pathname.startsWith("/documents"),
    },
    {
      title: "Documentos",
      url: "/documents",
      icon: FileUp,
      isActive: pathname.startsWith("/documents"),
    },
  ];

  const groupedConversations = React.useMemo(
    () => groupConversationsByDate(conversations),
    [conversations]
  );

  const isDocumentsSection = pathname.startsWith("/documents");

  const documentsNav = [
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

  if (isMobile) {
    return (
      <Sidebar className="w-full" {...props}>
        <SidebarHeader className="gap-2 border-b p-3">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Synapse</span>
              <span className="truncate text-xs text-muted-foreground">RAG System</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={item.isActive} asChild className="px-4">
                      <Link href={item.url}>
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isDocumentsSection ? (
            <SidebarGroup className="px-0">
              <SidebarGroupContent>
                <SidebarMenu>
                  {documentsNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={item.isActive} asChild className="px-4 py-2">
                        <Link href={item.url}>
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <>
              <SidebarGroup className="px-3">
                <Button
                  onClick={onNewConversation}
                  className="w-full justify-start gap-2 h-9 mb-2"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Nova conversa
                </Button>
                <Button
                  onClick={() => setSearchOpen(true)}
                  className="w-full justify-start gap-2 h-9"
                  variant="outline"
                >
                  <Search className="h-4 w-4" />
                  Buscar conversas
                </Button>
              </SidebarGroup>

              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-full bg-primary/10 p-4"
                  >
                    <Sparkles className="h-8 w-8 text-primary" />
                  </motion.div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Comece uma nova conversa</p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Clique no botão &quot;Nova conversa&quot; para começar
                    </p>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {groupedConversations.map((group) => (
                    <SidebarGroup key={group.label} className="px-0">
                      <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground px-3 py-1.5">
                        {group.label}
                      </SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
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
            </>
          )}
        </SidebarContent>

        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>

        <ConversationSearchDialog
          conversations={conversations}
          open={searchOpen}
          onOpenChange={setSearchOpen}
        />
      </Sidebar>
    );
  }

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
        {...props}
      >
        <Sidebar
          collapsible="none"
          className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
        >
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                  <Link href="/">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Brain className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Synapse</span>
                      <span className="truncate text-xs">RAG System</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="px-1.5 md:px-0">
                <SidebarMenu>
                  {navMain.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        isActive={item.isActive}
                        className="px-2.5 md:px-2"
                        asChild
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={user} />
          </SidebarFooter>
        </Sidebar>

        <Sidebar collapsible="none" className="flex-1">
          <SidebarHeader className="gap-3 border-b p-3">
            {!isDocumentsSection ? (
              <>
                <Button
                  onClick={onNewConversation}
                  className="w-full justify-start gap-2 h-9"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Nova conversa
                </Button>
                <Button
                  onClick={() => setSearchOpen(true)}
                  className="w-full justify-start gap-2 h-9"
                  variant="outline"
                >
                  <Search className="h-4 w-4" />
                  Buscar conversas
                </Button>
              </>
            ) : (
              <div className="text-sm font-medium text-foreground">
                {navMain.find((item) => item.isActive)?.title}
              </div>
            )}
          </SidebarHeader>
        <SidebarContent>
          {isDocumentsSection ? (
            <SidebarGroup className="px-0">
              <SidebarGroupContent>
                <SidebarMenu>
                  {documentsNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={item.isActive}
                        asChild
                        className="px-4 py-2"
                      >
                        <Link href={item.url}>
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <>
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-full bg-primary/10 p-4"
                  >
                    <Sparkles className="h-8 w-8 text-primary" />
                  </motion.div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Comece uma nova conversa</p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Clique no botão &quot;Nova conversa&quot; para começar
                    </p>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {groupedConversations.map((group) => (
                    <SidebarGroup key={group.label} className="px-0">
                      <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground px-3 py-1.5">
                        {group.label}
                      </SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
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
            </>
          )}
        </SidebarContent>
        </Sidebar>
      </Sidebar>

      <ConversationSearchDialog
        conversations={conversations}
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </>
  );
}
