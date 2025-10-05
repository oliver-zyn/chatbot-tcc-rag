"use client";

import { FileText, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, getFileTypeLabel } from "@/lib/constants/documents";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Document } from "@/lib/db/schema/documents";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { deleteDocumentAction } from "@/lib/actions/documents";
import { useRouter } from "next/navigation";

interface DocumentListProps {
  documents: Document[];
  currentUserId: string;
}

export function DocumentList({ documents, currentUserId }: DocumentListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (id: string) => {
    setDeletingId(id);

    try {
      const result = await deleteDocumentAction(id);

      if (result.success) {
        toast.success("Documento deletado com sucesso");
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erro ao deletar documento");
    } finally {
      setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
        <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-medium mb-1">Nenhum documento ainda</h3>
        <p className="text-sm text-muted-foreground">
          Faça upload do seu primeiro documento para começar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Documentos processados</h2>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.fileName}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="font-mono">{getFileTypeLabel(doc.fileType)}</span>
                  <span>•</span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>•</span>
                  <span>
                    {new Date(doc.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            {doc.userId === currentUserId ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingId === doc.id}
                    className="flex-shrink-0"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deletar documento</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja deletar este documento? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(doc.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Deletar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <div className="w-10" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
