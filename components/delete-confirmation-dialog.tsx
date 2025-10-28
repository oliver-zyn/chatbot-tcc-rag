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

interface DeleteConfirmationDialogProps {
  /**
   * The trigger element that opens the dialog (e.g., a delete button)
   */
  trigger: React.ReactNode;

  /**
   * Title of the dialog
   */
  title: string;

  /**
   * Description/warning message
   */
  description: string;

  /**
   * Callback function when delete is confirmed
   */
  onConfirm: () => void;

  /**
   * Optional: Stops event propagation (useful when dialog is inside clickable elements)
   */
  stopPropagation?: boolean;
}

export function DeleteConfirmationDialog({
  trigger,
  title,
  description,
  onConfirm,
  stopPropagation = false,
}: DeleteConfirmationDialogProps) {
  const handleConfirm = (e?: React.MouseEvent) => {
    if (stopPropagation && e) {
      e.stopPropagation();
    }
    onConfirm();
  };

  const handleContentClick = stopPropagation
    ? (e: React.MouseEvent) => e.stopPropagation()
    : undefined;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent onClick={handleContentClick}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Deletar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
