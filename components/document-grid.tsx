"use client";

import * as React from "react";
import { FileText, FileType, File, Calendar, User, HardDrive } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Document } from "@/lib/db/schema/documents";
import { DocumentViewerModal } from "./document-viewer-modal";

interface DocumentGridProps {
  documents: Document[];
  currentUserId: string;
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes("pdf")) return FileType;
  if (fileType.includes("word") || fileType.includes("docx")) return FileText;
  return File;
};

const getFileTypeLabel = (fileType: string) => {
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("word") || fileType.includes("docx")) return "DOCX";
  if (fileType.includes("text")) return "TXT";
  return fileType.split("/")[1]?.toUpperCase() || "FILE";
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export function DocumentGrid({ documents, currentUserId }: DocumentGridProps) {
  const [selectedDocument, setSelectedDocument] = React.useState<Document | null>(null);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.map((document) => {
          const Icon = getFileIcon(document.fileType);
          const isOwner = document.userId === currentUserId;

          return (
            <Card
              key={document.id}
              className="cursor-pointer hover:shadow-md transition-shadow duration-200 group"
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
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {getFileTypeLabel(document.fileType)}
                  </Badge>
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

      <DocumentViewerModal
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        currentUserId={currentUserId}
      />
    </>
  );
}
