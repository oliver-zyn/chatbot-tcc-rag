/**
 * Barrel export de todos os utilitários
 * Permite importar qualquer utilitário de @/lib/utils
 */

// Utilitários de UI/CSS
export { cn } from "./cn";

// Utilitários de string
export { getInitials } from "./string";

// Utilitários de criptografia
export { generateHashedPassword } from "./crypto";

// Utilitários de data
export {
  formatDate,
  formatDateReadable,
  formatDateRelative,
  isConversationRecent,
  groupConversationsByDate,
  type ConversationGroup,
} from "./date";

// Utilitários de ticket
export {
  extractTicketNumber,
  isTicketDocument,
  formatTicketDisplay,
} from "./ticket";

// Utilitários de formatação
export {
  formatFileSize,
  getFileTypeLabel,
  getFileTypeIconName,
} from "./format";

// Re-export de bibliotecas externas
export { nanoid } from "nanoid";
