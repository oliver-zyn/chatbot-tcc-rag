"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MoreVertical, Trash2, Pencil, Pin, PinOff } from "lucide-react";
import { motion } from "framer-motion";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateConversationTitleAction, toggleConversationPinAction } from "@/lib/actions/conversations";
import type { ConversationWithLastMessage } from "@/lib/db/queries/conversations";
import { toast } from "sonner";
import { isConversationRecent } from "@/lib/utils/date-grouping";

interface ConversationItemProps {
  conversation: ConversationWithLastMessage;
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

    const result = await updateConversationTitleAction(conversation.id, editedTitle.trim());

    if (result.success) {
      setIsEditing(false);
      toast.success("Título atualizado com sucesso");
    } else {
      toast.error(result.error);
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

  const handleTogglePin = async () => {
    const result = await toggleConversationPinAction(conversation.id, !conversation.isPinned);
    if (result.success) {
      toast.success(conversation.isPinned ? "Conversa desafixada" : "Conversa fixada");
    } else {
      toast.error(result.error);
    }
  };

  const isRecent = isConversationRecent(conversation.updatedAt);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={isActive}>
            {isEditing ? (
              <div className="flex items-center w-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  className="font-medium text-sm bg-background rounded px-2 py-0.5 border-none outline-none focus:ring-0 w-full"
                />
              </div>
            ) : (
              <Link href={`/chat/${conversation.id}`}>
                <div className="flex items-center gap-1.5 flex-1 overflow-hidden w-full">
                  {isRecent && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-2 w-2 rounded-full bg-blue-500 shrink-0"
                    />
                  )}
                  {conversation.isPinned && (
                    <Pin className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  <span className="font-medium text-sm truncate flex-1">
                    {conversation.title}
                  </span>
                </div>
              </Link>
            )}
          </SidebarMenuButton>

          <DropdownMenu modal={false}>
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
                onSelect={handleTogglePin}
              >
                {conversation.isPinned ? (
                  <>
                    <PinOff className="h-4 w-4" />
                    <span>Desafixar</span>
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4" />
                    <span>Fixar</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
                <span>Renomear</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
                onSelect={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Deletar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta conversa? Todas as mensagens serão perdidas e esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(conversation.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
