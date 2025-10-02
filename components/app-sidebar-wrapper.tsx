"use client";

import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { AppSidebar } from "./app-sidebar";
import { createNewConversation, deleteConversationAction } from "@/lib/actions/conversations";
import type { Conversation } from "@/lib/db/schema/conversations";

interface AppSidebarWrapperProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  conversations: Conversation[];
}

export function AppSidebarWrapper({ user, conversations }: AppSidebarWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNewConversation = async () => {
    try {
      await createNewConversation();
    } catch (error) {
      toast.error("Erro ao criar conversa");
    }
  };

  const handleDeleteConversation = async (id: string) => {
    const result = await deleteConversationAction(id);

    if (result.success) {
      toast.success("Conversa deletada com sucesso");

      if (pathname === `/chat/${id}`) {
        router.push("/");
      }

      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <AppSidebar
      user={user}
      conversations={conversations}
      onNewConversation={handleNewConversation}
      onDeleteConversation={handleDeleteConversation}
    />
  );
}
