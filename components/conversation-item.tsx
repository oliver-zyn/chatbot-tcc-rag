"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Trash2, Pin, PinOff, Loader2, Pencil } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toggleConversationPinAction, updateConversationTitleAction } from "@/lib/actions/conversations";
import type { ConversationWithLastMessage } from "@/lib/db/queries/conversations";
import { toast } from "sonner";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);

  const handleTogglePin = async () => {
    setIsPinning(true);
    try {
      const result = await toggleConversationPinAction(conversation.id, !conversation.isPinned);
      if (result.success) {
        toast.success(conversation.isPinned ? "Conversa desafixada" : "Conversa fixada");
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsPinning(false);
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    try {
      onDelete(conversation.id);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle.trim() === conversation.title) {
      setShowRenameDialog(false);
      setNewTitle(conversation.title);
      return;
    }

    setIsRenaming(true);
    try {
      const result = await updateConversationTitleAction(conversation.id, newTitle.trim());
      if (result.success) {
        toast.success("Título atualizado com sucesso");
        setShowRenameDialog(false);
      } else {
        toast.error(result.error);
        setNewTitle(conversation.title);
      }
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link href={`/chat/${conversation.id}`}>
            {conversation.isPinned && (
              <Pin className="h-3 w-3 text-muted-foreground" />
            )}
            <span>{conversation.title}</span>
          </Link>
        </SidebarMenuButton>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              showOnHover={!isActive}
            >
              <MoreHorizontal />
              <span className="sr-only">Mais</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={handleTogglePin}
              disabled={isPinning}
            >
              {isPinning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{conversation.isPinned ? "Desafixando..." : "Fixando..."}</span>
                </>
              ) : conversation.isPinned ? (
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
              onSelect={() => {
                setNewTitle(conversation.title);
                setShowRenameDialog(true);
              }}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta conversa? Todas as mensagens serão perdidas e esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Renomear conversa</DialogTitle>
            <DialogDescription>
              Digite um novo título para esta conversa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename();
                }
              }}
              placeholder="Digite o título..."
              disabled={isRenaming}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRenameDialog(false);
                setNewTitle(conversation.title);
              }}
              disabled={isRenaming}
            >
              Cancelar
            </Button>
            <Button onClick={handleRename} disabled={isRenaming}>
              {isRenaming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
