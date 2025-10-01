"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppSidebar } from "./app-sidebar";
import { createNewConversation, deleteConversationAction } from "@/app/(chat)/actions";
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

  const handleNewConversation = async () => {
    try {
      await createNewConversation();
    } catch (error) {
      toast.error("Erro ao criar conversa");
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta conversa?")) {
      return;
    }

    try {
      await deleteConversationAction(id);
      toast.success("Conversa deletada com sucesso");
    } catch (error) {
      toast.error("Erro ao deletar conversa");
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
