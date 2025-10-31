import type { Document } from '@/lib/db/schema/documents';
import { extractTicketNumber } from '@/lib/utils/ticket';
import { appConfig } from '@/lib/config/app-config';

export interface SimilarTicket {
  document: Document;
}

/**
 * Constrói o contexto de tickets similares
 */
export function buildSimilarTicketsContext(similarTickets: SimilarTicket[]): string {
  if (!similarTickets || similarTickets.length === 0) {
    return '';
  }

  const ticketsFormatted = similarTickets
    .map((item) => {
      const ticketNumber = extractTicketNumber(item.document.fileName);
      const content = item.document.content

      return `TICKET #${ticketNumber}:\n${content}`;
    })
    .join('\n\n---\n\n');

  return '\n\n--- TICKETS RELACIONADOS ---\n\n' +
    'Os seguintes tickets têm problemas ou soluções semelhantes:\n\n' +
    ticketsFormatted;
}

/**
 * Retorna instruções para o sistema sobre como processar tickets similares
 * Apenas incluído quando há tickets similares no contexto
 */
export function getSimilarTicketsInstructions(): string {
  return `
  IMPORTANTE: Há tickets similares no contexto marcados como "--- TICKETS RELACIONADOS ---".
  Ao final da sua resposta, inclua uma seção formatada assim:

  ### 🎫 Tickets Relacionados

  Liste cada ticket similar com:
  - Número do ticket
  - Problema principal (1 linha)
  - Solução aplicada (1 linha)`;
}
