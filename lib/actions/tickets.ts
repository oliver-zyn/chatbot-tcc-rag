"use server";

import { findDocumentByTicketNumber } from "@/lib/db/queries/tickets";
import { actionError, actionSuccess, type ActionResponse } from "@/lib/types/action-response";
import { withAuth } from "./utils";
import { logError } from "@/lib/errors/logger";
import type { Document } from "@/lib/db/schema/documents";

export async function findDocumentByTicketNumberAction(
  ticketNumber: string
): Promise<ActionResponse<Document | null>> {
  try {
    if (!ticketNumber || ticketNumber.trim().length === 0) {
      return actionError("Número do ticket é obrigatório");
    }

    return await withAuth(async () => {
      const document = await findDocumentByTicketNumber(ticketNumber);
      return actionSuccess(document);
    });
  } catch (error) {
    logError(error, { action: "findDocumentByTicketNumber", ticketNumber });
    return actionError("Erro ao buscar documento por número de ticket");
  }
}
