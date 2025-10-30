import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseDeleteActionOptions<T> {
  /**
   * Server action que realiza a operação de delete
   */
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;

  /**
   * Mensagem de sucesso a ser exibida
   */
  successMessage?: string;

  /**
   * Mensagem de erro a ser exibida
   */
  errorMessage?: string;

  /**
   * Callback executado após sucesso
   */
  onSuccess?: (id: string) => void;

  /**
   * Callback executado após erro
   */
  onError?: (id: string, error?: string) => void;
}

interface UseDeleteActionReturn {
  /**
   * ID do item sendo deletado atualmente
   */
  deletingId: string | null;

  /**
   * Função para executar o delete
   */
  handleDelete: (id: string) => Promise<void>;

  /**
   * Verifica se um item específico está sendo deletado
   */
  isDeleting: (id: string) => boolean;
}

/**
 * Hook reutilizável para operações de delete com feedback visual
 *
 * @example
 * ```tsx
 * const { deletingId, handleDelete } = useDeleteAction({
 *   deleteAction: deleteDocumentAction,
 *   successMessage: "Documento deletado",
 *   errorMessage: "Erro ao deletar"
 * });
 *
 * return (
 *   <Button
 *     onClick={() => handleDelete(doc.id)}
 *     disabled={deletingId === doc.id}
 *   >
 *     {deletingId === doc.id ? "Deletando..." : "Deletar"}
 *   </Button>
 * );
 * ```
 */
export function useDeleteAction<T = unknown>({
  deleteAction,
  successMessage = "Item deletado com sucesso",
  errorMessage = "Erro ao deletar item",
  onSuccess,
  onError,
}: UseDeleteActionOptions<T>): UseDeleteActionReturn {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);

    try {
      const result = await deleteAction(id);

      if (result.success) {
        toast.success(successMessage);
        router.refresh();
        onSuccess?.(id);
      } else {
        toast.error(result.error || errorMessage);
        onError?.(id, result.error);
      }
    } catch (error) {
      toast.error(errorMessage);
      onError?.(id);
    } finally {
      setDeletingId(null);
    }
  };

  const isDeleting = (id: string) => deletingId === id;

  return {
    deletingId,
    handleDelete,
    isDeleting,
  };
}
