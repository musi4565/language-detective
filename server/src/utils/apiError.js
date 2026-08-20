export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFoundError = (msg = "Resource not found") => new ApiError(404, msg);
export const badRequestError = (msg = "Bad request", details) => new ApiError(400, msg, details);
export const unauthorizedError = (msg = "Unauthorized") => new ApiError(401, msg);
export const forbiddenError = (msg = "Forbidden") => new ApiError(403, msg);
export const conflictError = (msg = "Conflict") => new ApiError(409, msg);
export const tooManyRequestsError = (msg = "Too many requests") => new ApiError(429, msg);