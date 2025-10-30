/**
 * Utilitários para formatação e manipulação de datas
 */

import type { ConversationWithLastMessage } from "@/lib/db/queries/conversations";

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

/**
 * Verifica se uma conversa foi atualizada recentemente (últimas 24 horas)
 * @param updatedAt - Data da última atualização
 * @returns true se foi atualizada nas últimas 24 horas
 */
export function isConversationRecent(updatedAt: Date): boolean {
  const now = new Date();
  const diff = now.getTime() - new Date(updatedAt).getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours <= 24;
}

/**
 * Tipo para grupos de conversas por período
 */
export type ConversationGroup = {
  label: string;
  conversations: ConversationWithLastMessage[];
};

/**
 * Agrupa conversas por período temporal
 * @param conversations - Lista de conversas a agrupar
 * @returns Array de grupos ordenados por período
 */
export function groupConversationsByDate(
  conversations: ConversationWithLastMessage[]
): ConversationGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setDate(lastMonth.getDate() - 30);

  const groups: Record<string, ConversationWithLastMessage[]> = {
    pinned: [],
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
    older: [],
  };

  conversations.forEach((conversation) => {
    if (conversation.isPinned) {
      groups.pinned.push(conversation);
      return;
    }

    const updatedAt = new Date(conversation.updatedAt);

    if (updatedAt >= today) {
      groups.today.push(conversation);
    } else if (updatedAt >= yesterday) {
      groups.yesterday.push(conversation);
    } else if (updatedAt >= lastWeek) {
      groups.lastWeek.push(conversation);
    } else if (updatedAt >= lastMonth) {
      groups.lastMonth.push(conversation);
    } else {
      groups.older.push(conversation);
    }
  });

  const result: ConversationGroup[] = [];

  if (groups.pinned.length > 0) {
    result.push({ label: "Fixadas", conversations: groups.pinned });
  }
  if (groups.today.length > 0) {
    result.push({ label: "Hoje", conversations: groups.today });
  }
  if (groups.yesterday.length > 0) {
    result.push({ label: "Ontem", conversations: groups.yesterday });
  }
  if (groups.lastWeek.length > 0) {
    result.push({ label: "Últimos 7 dias", conversations: groups.lastWeek });
  }
  if (groups.lastMonth.length > 0) {
    result.push({ label: "Últimos 30 dias", conversations: groups.lastMonth });
  }
  if (groups.older.length > 0) {
    result.push({ label: "Mais antigos", conversations: groups.older });
  }

  return result;
}
