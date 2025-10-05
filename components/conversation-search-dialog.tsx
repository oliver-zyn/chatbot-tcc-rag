"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, MessageSquare, Pin, Clock } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { ConversationWithLastMessage } from "@/lib/db/queries/conversations";
import { groupConversationsByDate } from "@/lib/utils/date-grouping";

interface ConversationSearchDialogProps {
  conversations: ConversationWithLastMessage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConversationSearchDialog({
  conversations,
  open,
  onOpenChange,
}: ConversationSearchDialogProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const filteredConversations = React.useMemo(() => {
    if (!search) return conversations;
    return conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search]);

  const groupedConversations = React.useMemo(
    () => groupConversationsByDate(filteredConversations),
    [filteredConversations]
  );

  const handleSelect = (conversationId: string) => {
    onOpenChange(false);
    setSearch("");
    router.push(`/chat/${conversationId}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar conversas..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nenhuma conversa encontrada.</CommandEmpty>
        {groupedConversations.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.conversations.map((conversation) => (
              <CommandItem
                key={conversation.id}
                value={conversation.title}
                onSelect={() => handleSelect(conversation.id)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex items-center gap-2">
                  {conversation.isPinned && (
                    <Pin className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className="truncate">{conversation.title}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
