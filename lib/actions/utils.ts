import { auth } from "@/app/(auth)/auth";
import { actionError, actionSuccess, type ActionResponse } from "@/lib/types/action-response";

export async function withAuth<T>(
  handler: (userId: string) => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> {
  const session = await auth();

  if (!session?.user?.id) {
    return actionError("Não autorizado");
  }

  return handler(session.user.id);
}

type ResourceWithUserId = { userId: string } | null;

export async function authorizeResourceAccess<T extends ResourceWithUserId>(
  resourceGetter: () => Promise<T>,
  userId: string,
  resourceName: string
): Promise<ActionResponse<NonNullable<T>>> {
  const resource = await resourceGetter();

  if (!resource) {
    return actionError(`${resourceName} não encontrado`);
  }

  if (resource.userId !== userId) {
    return actionError(
      `Você não tem permissão para acessar este ${resourceName.toLowerCase()}`
    );
  }

  return actionSuccess(resource);
}
