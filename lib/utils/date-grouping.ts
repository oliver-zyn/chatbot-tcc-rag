import type { ConversationWithLastMessage } from "@/lib/db/queries/conversations";

export type ConversationGroup = {
  label: string;
  conversations: ConversationWithLastMessage[];
};

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

export function isConversationRecent(updatedAt: Date): boolean {
  const now = new Date();
  const diff = now.getTime() - new Date(updatedAt).getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours <= 24;
}
