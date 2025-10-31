import { env } from "@/lib/env";

interface ErrorContext {
  [key: string]: unknown;
}

export function logError(error: unknown, context: ErrorContext = {}) {
  const timestamp = new Date().toISOString();

  const errorInfo = {
    timestamp,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    context,
  };

  console.error("Error occurred:", errorInfo);

  // Em produção, enviar para serviço de monitoramento
  if (env.NODE_ENV === "production") {
    // TODO: Integrar com serviço de monitoramento (Sentry, DataDog, etc)
  }
}

export function logDatabaseError(
  error: unknown,
  operation: string,
  additionalContext: ErrorContext = {}
) {
  logError(error, {
    type: "database",
    operation,
    ...additionalContext,
  });
}

export function logAuthError(error: unknown, context: ErrorContext = {}) {
  logError(error, {
    type: "authentication",
    ...context,
  });
}
