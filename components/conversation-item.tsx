"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreVertical, Trash2, Pencil } from "lucide-react";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateConversationTitleAction } from "@/app/(chat)/actions";
import type { Conversation } from "@/lib/db/schema/conversations";
import { toast } from "sonner";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onDelete: (id: string) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onDelete,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!editedTitle.trim()) {
      setEditedTitle(conversation.title);
      setIsEditing(false);
      return;
    }

    if (editedTitle.trim() === conversation.title) {
      setIsEditing(false);
      return;
    }

    try {
      await updateConversationTitleAction(conversation.id, editedTitle.trim());
      setIsEditing(false);
      toast.success("Título atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar título");
      setEditedTitle(conversation.title);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditedTitle(conversation.title);
      setIsEditing(false);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} size="lg" className="h-16">
        {isEditing ? (
          <div className="flex items-start w-full">
            <div className="flex flex-col gap-1 flex-1 overflow-hidden">
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="font-medium text-sm bg-background rounded px-2 py-0.5 border-none outline-none focus:ring-0 w-full"
              />
              <span className="text-xs text-muted-foreground">
                {new Date(conversation.updatedAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        ) : (
          <Link href={`/chat/${conversation.id}`}>
            <div className="flex flex-col gap-1 flex-1 overflow-hidden">
              <span className="font-medium text-sm truncate">
                {conversation.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(conversation.updatedAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          </Link>
        )}
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            showOnHover={!isActive}
          >
            <MoreVertical />
            <span className="sr-only">Mais</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            <span>Renomear</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
            onSelect={() => onDelete(conversation.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span>Deletar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
