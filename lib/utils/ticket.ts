/**
 * Utilitários para trabalhar com tickets
 */

/**
 * Extrai o número de um ticket a partir do nome do arquivo
 * @param fileName - Nome do arquivo (ex: "ticket-12345.txt", "ticket_67890.pdf")
 * @returns Número do ticket ou 'desconhecido' se não encontrado
 */
export function extractTicketNumber(fileName: string): string {
  const match = fileName.match(/ticket[_-]?(\d+)/i);
  return match ? match[1] : 'desconhecido';
}

/**
 * Verifica se um nome de arquivo representa um documento de ticket
 * @param fileName - Nome do arquivo
 * @returns true se o arquivo é um ticket
 */
export function isTicketDocument(fileName: string): boolean {
  return /ticket[_-]?\d+/i.test(fileName);
}

/**
 * Formata um número de ticket para exibição
 * @param ticketNumber - Número do ticket
 * @returns String formatada (ex: "#12345")
 */
export function formatTicketDisplay(ticketNumber: string): string {
  return `#${ticketNumber}`;
}
