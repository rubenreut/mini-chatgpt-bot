/**
 * Standardized error types for the application
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  NO_API_KEY = 'NO_API_KEY',
  VALIDATION = 'VALIDATION',
  API = 'API',
  CANCELLED = 'CANCELLED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Standardized API error interface
 */
export interface ApiError extends Error {
  type: ErrorType;
  statusCode?: number;
  originalError?: any;
  request?: any;
  response?: any;
}

/**
 * Create a standardized API error
 */
export function createApiError(
  message: string, 
  type: ErrorType = ErrorType.UNKNOWN, 
  statusCode?: number,
  originalError?: any
): ApiError {
  const error = new Error(message) as ApiError;
  error.type = type;
  error.statusCode = statusCode;
  error.originalError = originalError;
  return error;
}

export default ErrorType;