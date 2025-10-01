import { z } from "zod";

export const createConversationSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

export const updateConversationTitleSchema = z.object({
  conversationId: z.string().uuid("ID de conversa inválido"),
  title: z.string().min(1, "Título não pode ser vazio").max(100, "Título muito longo").trim(),
});

export const deleteConversationSchema = z.object({
  conversationId: z.string().uuid("ID de conversa inválido"),
});

export const getConversationSchema = z.object({
  conversationId: z.string().uuid("ID de conversa inválido"),
});
