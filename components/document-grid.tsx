"use client";

import * as React from "react";
import { FileText, FileType, File, Calendar, User, HardDrive, Trash2, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFileSize, getFileTypeLabel, getFileTypeIconName } from "@/lib/constants/documents";
import { formatDate } from "@/lib/utils/date";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { useDeleteAction } from "@/hooks/use-delete-action";
import type { Document } from "@/lib/db/schema/documents";
import { DocumentViewerModal } from "./document-viewer-modal";
import { deleteDocumentAction } from "@/lib/actions/documents";

interface DocumentGridProps {
  documents: Document[];
  currentUserId: string;
}

const iconMap = {
  FileType,
  FileText,
  File,
};

const getFileIcon = (fileType: string) => {
  const iconName = getFileTypeIconName(fileType);
  return iconMap[iconName];
};

export function DocumentGrid({ documents, currentUserId }: DocumentGridProps) {
  const [selectedDocument, setSelectedDocument] = React.useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [fileTypeFilter, setFileTypeFilter] = React.useState<string>("all");
  const [ownerFilter, setOwnerFilter] = React.useState<string>("all");

  const { deletingId, handleDelete } = useDeleteAction({
    deleteAction: deleteDocumentAction,
    successMessage: "Documento deletado com sucesso",
    errorMessage: "Erro ao deletar documento",
  });

  const filteredDocuments = React.useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFileType = fileTypeFilter === "all" || doc.fileType.toLowerCase() === fileTypeFilter;
      const matchesOwner = ownerFilter === "all" ||
        (ownerFilter === "mine" && doc.userId === currentUserId) ||
        (ownerFilter === "others" && doc.userId !== currentUserId);

      return matchesSearch && matchesFileType && matchesOwner;
    });
  }, [documents, searchQuery, fileTypeFilter, ownerFilter, currentUserId]);

  const uniqueFileTypes = React.useMemo(() => {
    const types = new Set(documents.map(doc => doc.fileType.toLowerCase()));
    return Array.from(types).sort();
  }, [documents]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setFileTypeFilter("all");
    setOwnerFilter("all");
  };

  const hasActiveFilters = searchQuery !== "" || fileTypeFilter !== "all" || ownerFilter !== "all";

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <File className="h-16 w-16 mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Nenhum documento ainda</h3>
        <p className="text-sm text-muted-foreground">
          Faça upload de documentos para vê-los aqui
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filtros</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-7 text-xs ml-auto"
            >
              Limpar filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de arquivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {uniqueFileTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {getFileTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Proprietário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os documentos</SelectItem>
              <SelectItem value="mine">Meus documentos</SelectItem>
              <SelectItem value="others">Outros usuários</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {filteredDocuments.length} {filteredDocuments.length === 1 ? "documento encontrado" : "documentos encontrados"}
          </span>
          {hasActiveFilters && (
            <span className="text-xs">
              (de {documents.length} total)
            </span>
          )}
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <File className="h-16 w-16 mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Tente ajustar os filtros para encontrar o que procura
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((document) => {
          const Icon = getFileIcon(document.fileType);
          const isOwner = document.userId === currentUserId;

          return (
            <Card
              key={document.id}
              className="cursor-pointer hover:shadow-md transition-shadow duration-200 group relative"
              onClick={() => setSelectedDocument(document)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-sm font-medium truncate">
                      {document.fileName}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {getFileTypeLabel(document.fileType)}
                    </Badge>
                    {isOwner && (
                      <DeleteConfirmationDialog
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            disabled={deletingId === document.id}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        }
                        title="Deletar documento?"
                        description={`Esta ação não pode ser desfeita. O documento "${document.fileName}" será permanentemente removido.`}
                        onConfirm={() => handleDelete(document.id)}
                        stopPropagation
                      />
                    )}
                  </div>
                </div>
                <CardDescription className="line-clamp-2 text-xs mt-2">
                  {document.content.substring(0, 100)}...
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <HardDrive className="h-3 w-3" />
                  <span>{formatFileSize(document.fileSize)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(document.createdAt)}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {isOwner ? "Seu documento" : "Outro usuário"}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      <DocumentViewerModal
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        currentUserId={currentUserId}
      />
    </>
  );
}
