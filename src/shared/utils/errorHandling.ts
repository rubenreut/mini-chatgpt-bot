import { ApiError } from '../types';

/**
 * Standard error types used throughout the application
 */
export enum ErrorType {
  NETWORK = 'network',
  AUTH = 'auth',
  RATE_LIMIT = 'ratelimit',
  SERVER = 'server',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
  NO_API_KEY = 'no_api_key',
}

/**
 * Standardized error handling function that converts any error into a typed ApiError
 * Use this consistently throughout the application
 */
export const handleApiError = (error: unknown): ApiError => {
  console.error('API Error:', error);
  
  // If it's already an ApiError, return it
  if (typeof error === 'object' && error !== null && 'type' in error) {
    return error as ApiError;
  }
  
  // Handle specific error types
  if (error instanceof Error) {
    // Extract response info if it's a fetch error
    if ('response' in error) {
      const responseError = error as any;
      const status = responseError.response?.status;
      
      if (status === 401) {
        return {
          type: ErrorType.AUTH,
          message: 'Invalid API key. Please check your OpenAI API key and try again.',
          original: error,
        };
      }
      
      if (status === 429) {
        return {
          type: ErrorType.RATE_LIMIT,
          message: 'Rate limit exceeded. Please try again later.',
          original: error,
        };
      }
      
      if (status >= 500) {
        return {
          type: ErrorType.SERVER,
          message: 'Server error. Please try again later.',
          original: error,
        };
      }
    }
    
    // Generic error with message
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'An unknown error occurred',
      original: error,
    };
  }
  
  // Network errors
  if (typeof error === 'object' && error !== null && 'message' in error && (error as any).message.includes('network')) {
    return {
      type: ErrorType.NETWORK,
      message: 'Network error. Please check your internet connection.',
      original: error,
    };
  }
  
  // Fallback for anything else
  return {
    type: ErrorType.UNKNOWN,
    message: typeof error === 'string' ? error : 'An unknown error occurred',
    original: error,
  };
};

/**
 * Helper to determine if an error is related to authentication
 */
export const isAuthError = (error: ApiError | null): boolean => {
  return error?.type === ErrorType.AUTH || error?.type === ErrorType.NO_API_KEY;
};

/**
 * Standardized error handler for asynchronous operations
 * Use with try/catch blocks
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  onError?: (error: ApiError) => void
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    const apiError = handleApiError(error);
    
    if (onError) {
      onError(apiError);
    } else {
      console.error('Operation failed:', apiError.message);
    }
    
    return null;
  }
};