"use server";

import { revalidatePath } from "next/cache";
import {
  createOrUpdateVote,
  deleteVote,
  getVoteByMessageId,
} from "@/lib/db/queries";
import {
  actionError,
  actionSuccess,
  type ActionResponse,
} from "@/lib/types/action-response";
import { withAuth } from "./utils";
import { logError } from "@/lib/errors/logger";

export async function voteMessage(
  messageId: string,
  isUpvoted: boolean
): Promise<ActionResponse<void>> {
  try {
    return await withAuth(async (userId) => {
      await createOrUpdateVote(messageId, userId, isUpvoted);
      revalidatePath("/");

      return actionSuccess(undefined);
    });
  } catch (error) {
    logError(error, { action: "voteMessage", messageId });
    return actionError("Erro ao votar na mensagem");
  }
}

export async function removeVote(
  messageId: string
): Promise<ActionResponse<void>> {
  try {
    return await withAuth(async (userId) => {
      await deleteVote(messageId, userId);
      revalidatePath("/");

      return actionSuccess(undefined);
    });
  } catch (error) {
    logError(error, { action: "removeVote", messageId });
    return actionError("Erro ao remover voto");
  }
}

export async function getVote(messageId: string) {
  try {
    return await withAuth(async (userId) => {
      const vote = await getVoteByMessageId(messageId, userId);
      return actionSuccess(vote);
    });
  } catch (error) {
    logError(error, { action: "getVote", messageId });
    return actionError("Erro ao buscar voto");
  }
}
