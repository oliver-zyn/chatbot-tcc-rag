"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
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
import {
  FileText,
  Calendar,
  HardDrive,
  User,
  ChevronDown,
  ChevronRight,
  Blocks,
  Trash2,
} from "lucide-react";
import type { Document } from "@/lib/db/schema/documents";
import { getDocumentChunks } from "@/lib/actions/documents-chunks";
import { deleteDocumentAction } from "@/lib/actions/documents";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DocumentViewerModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const getFileTypeLabel = (fileType: string) => {
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("word") || fileType.includes("docx")) return "DOCX";
  if (fileType.includes("text")) return "TXT";
  return fileType;
};

export function DocumentViewerModal({
  document,
  isOpen,
  onClose,
  currentUserId,
}: DocumentViewerModalProps) {
  const router = useRouter();
  const [chunks, setChunks] = React.useState<Array<{ id: string; content: string }>>([]);
  const [isLoadingChunks, setIsLoadingChunks] = React.useState(false);
  const [chunksOpen, setChunksOpen] = React.useState(false);
  const [contentOpen, setContentOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Reset state quando trocar de documento
  React.useEffect(() => {
    setChunks([]);
    setChunksOpen(false);
    setContentOpen(false);
  }, [document?.id]);

  const handleDelete = async () => {
    if (!document) return;

    setIsDeleting(true);
    try {
      const result = await deleteDocumentAction(document.id);

      if (result.success) {
        toast.success("Documento deletado com sucesso");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erro ao deletar documento");
    } finally {
      setIsDeleting(false);
    }
  };

  React.useEffect(() => {
    if (document && chunksOpen && chunks.length === 0) {
      setIsLoadingChunks(true);
      getDocumentChunks(document.id)
        .then((result) => {
          if (result.success && result.data) {
            setChunks(result.data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingChunks(false));
    }
  }, [document, chunksOpen, chunks.length]);

  if (!document) return null;

  const isOwner = document.userId === currentUserId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="truncate">{document.fileName}</span>
                <Badge variant="secondary" className="flex-shrink-0">
                  {getFileTypeLabel(document.fileType)}
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-2">
                Documento completo e metadados
              </DialogDescription>
            </div>
            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deletar documento?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O documento &ldquo;{document.fileName}&rdquo; será
                      permanentemente removido.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Deletar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-200px)] pr-4">
            {/* Metadados */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Metadados
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tamanho:</span>
                  <span className="font-medium">{formatFileSize(document.fileSize)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Upload:</span>
                  <span className="font-medium">{formatDate(document.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Proprietário:</span>
                  <span className="font-medium">{isOwner ? "Você" : "Outro usuário"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Blocks className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="text-xs">
                    {document.status}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Conteúdo */}
            <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Conteúdo do Documento
                  </h3>
                  {contentOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mb-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {document.content}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-6" />

            {/* Chunks Gerados */}
            <Collapsible open={chunksOpen} onOpenChange={setChunksOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Chunks Gerados para Busca
                  </h3>
                  {chunksOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-3">
                {isLoadingChunks ? (
                  <p className="text-sm text-muted-foreground">Carregando chunks...</p>
                ) : chunks.length > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">
                      Este documento foi dividido em {chunks.length} chunks para otimizar a busca semântica.
                    </p>
                    {chunks.map((chunk, index) => (
                      <div
                        key={chunk.id}
                        className="bg-muted/30 rounded-lg p-3 border border-border"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Chunk {index + 1}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {chunk.content}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum chunk encontrado para este documento.
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
