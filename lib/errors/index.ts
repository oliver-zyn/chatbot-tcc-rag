export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Não autorizado") {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class PermissionError extends AppError {
  constructor(message: string) {
    super(message, "PERMISSION_DENIED", 403);
    this.name = "PermissionError";
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string,
    public operation: string,
    originalError?: unknown
  ) {
    super(message, "DATABASE_ERROR", 500, originalError);
    this.name = "DatabaseError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Limite de requisições excedido. Tente novamente mais tarde.") {
    super(message, "RATE_LIMIT_EXCEEDED", 429);
    this.name = "RateLimitError";
  }
}

export class FileUploadError extends AppError {
  constructor(message: string) {
    super(message, "FILE_UPLOAD_ERROR", 400);
    this.name = "FileUploadError";
  }
}
