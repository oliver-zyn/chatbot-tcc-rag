import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid("ID de conversa inválido"),
  content: z.string().min(1, "Mensagem não pode ser vazia").max(5000, "Mensagem muito longa").trim(),
});

export const createMessageSchema = z.object({
  conversationId: z.string().uuid("ID de conversa inválido"),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});
