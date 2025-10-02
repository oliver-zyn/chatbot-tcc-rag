"use client";

import { useState, useTransition } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadDocumentAction } from "@/lib/actions/documents";
import { useRouter } from "next/navigation";
import {
  MAX_FILE_SIZE,
  ACCEPTED_FILE_EXTENSIONS,
  ACCEPTED_EXTENSIONS_STRING,
  formatFileSize,
} from "@/lib/constants/documents";

export function DocumentUpload() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const validateFile = (file: File): string | null => {
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const acceptedExtensions = Object.values(ACCEPTED_FILE_EXTENSIONS).flat();
    const isValidType = acceptedExtensions.includes(
      fileExtension as (typeof acceptedExtensions)[number]
    );

    if (!isValidType) {
      return "Tipo de arquivo não suportado. Use TXT, PDF ou DOCX.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande. O tamanho máximo é ${formatFileSize(MAX_FILE_SIZE)}.`;
    }

    return null;
  };

  const handleUpload = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadDocumentAction(formData);

      if (result.success) {
        toast.success("Documento enviado com sucesso!");
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erro ao fazer upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    } else {
      toast.error("Seu navegador não suporta arrastar arquivos. Use o botão de seleção.");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {(isUploading || isPending) ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Processando documento...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-medium">Arraste e solte seu arquivo aqui</p>
            <p className="text-sm text-muted-foreground mt-1">
              ou clique no botão abaixo para selecionar
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-input")?.click()}
            className="mt-2"
          >
            <FileText className="h-4 w-4 mr-2" />
            Selecionar arquivo
          </Button>
          <input
            id="file-input"
            type="file"
            accept={ACCEPTED_EXTENSIONS_STRING}
            className="hidden"
            onChange={handleFileInput}
          />
          <p className="text-xs text-muted-foreground mt-2">
            TXT, PDF ou DOCX • Máximo 10MB
          </p>
        </div>
      )}
    </div>
  );
}
