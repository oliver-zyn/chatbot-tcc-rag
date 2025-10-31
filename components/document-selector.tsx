"use client";

import * as React from "react";
import { FileText, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFileTypeLabel } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/date";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Document } from "@/lib/db/schema/documents";
import { cn } from "@/lib/utils";

interface DocumentSelectorProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onSelectDocument: (documentId: string | null) => void;
  disabled?: boolean;
}

export function DocumentSelector({
  documents,
  selectedDocumentId,
  onSelectDocument,
  disabled = false,
}: DocumentSelectorProps) {
  const [open, setOpen] = React.useState(false);

  // Filtra apenas documentos que NÃO sejam tickets
  const nonTicketDocuments = documents.filter(doc =>
    !doc.fileName.toLowerCase().includes('ticket')
  );

  const selectedDocument = nonTicketDocuments.find(doc => doc.id === selectedDocumentId);

  const handleSelect = (documentId: string) => {
    onSelectDocument(documentId === selectedDocumentId ? null : documentId);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectDocument(null);
  };

  if (nonTicketDocuments.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={selectedDocument ? "secondary" : "outline"}
                    size="sm"
                    disabled={disabled}
                    className={cn(
                      "h-8 gap-2 text-xs",
                      selectedDocument && "pr-1",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
            <FileText className="h-3.5 w-3.5" />
            {selectedDocument ? (
              <>
                <span className="max-w-[150px] truncate">
                  {selectedDocument.fileName}
                </span>
                <Badge variant="outline" className="ml-1 h-5 px-1 text-[10px]">
                  {getFileTypeLabel(selectedDocument.fileType)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 hover:bg-background/80"
                  onClick={handleClear}
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                Selecionar documento
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <p className="text-sm font-medium">Documentos disponíveis</p>
            <p className="text-xs text-muted-foreground">
              {nonTicketDocuments.length} {nonTicketDocuments.length === 1 ? "documento" : "documentos"}
            </p>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-1">
              {nonTicketDocuments.map((document) => {
                const isSelected = document.id === selectedDocumentId;
                return (
                  <button
                    key={document.id}
                    onClick={() => handleSelect(document.id)}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                      isSelected && "bg-accent"
                    )}
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{document.fileName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {getFileTypeLabel(document.fileType)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(document.createdAt, false)}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
          {selectedDocumentId && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  onSelectDocument(null);
                  setOpen(false);
                }}
              >
                Limpar seleção
              </Button>
            </div>
          )}
        </PopoverContent>
            </Popover>
            </span>
          </TooltipTrigger>
          {disabled && (
            <TooltipContent>
              <p>Desative o ticket para selecionar documento</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
