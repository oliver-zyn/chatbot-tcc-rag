/**
 * Formata uma data para o padrão brasileiro (dd/mm/yyyy hh:mm)
 * @param date - Data a ser formatada (Date object ou string ISO)
 * @param includeTime - Se deve incluir horário (padrão: true)
 * @returns String formatada no padrão pt-BR
 */
export function formatDate(
  date: Date | string,
  includeTime: boolean = true
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (includeTime) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateObj);
}

/**
 * Formata uma data de forma mais legível (ex: "15 de jan. de 2024")
 * @param date - Data a ser formatada
 * @returns String formatada com mês abreviado
 */
export function formatDateReadable(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateObj);
}

/**
 * Formata uma data de forma relativa (ex: "há 2 dias", "há 3 horas")
 * @param date - Data a ser formatada
 * @returns String formatada de forma relativa
 */
export function formatDateRelative(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "agora mesmo";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `há ${diffInDays} ${diffInDays === 1 ? "dia" : "dias"}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `há ${diffInWeeks} ${diffInWeeks === 1 ? "semana" : "semanas"}`;
  }

  return formatDate(dateObj, false);
}
