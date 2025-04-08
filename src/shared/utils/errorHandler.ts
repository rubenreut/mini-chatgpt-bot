import { useToast } from '../contexts/ToastContext';
import { useAnalytics } from '../hooks/useAnalytics';

export enum ErrorSeverity {
  LOW = 'low',       // Non-critical errors, can be retried or ignored
  MEDIUM = 'medium', // Important but not fatal errors
  HIGH = 'high',     // Critical errors that need immediate attention
}

export interface ApplicationError extends Error {
  severity: ErrorSeverity;
  code?: string;
  context?: Record<string, any>;
  userMessage?: string;
  retry?: () => Promise<any>;
}

/**
 * Create an application error with standard format
 */
export function createAppError(
  message: string,
  options: {
    severity?: ErrorSeverity;
    code?: string;
    cause?: Error;
    context?: Record<string, any>;
    userMessage?: string;
    retry?: () => Promise<any>;
  } = {}
): ApplicationError {
  const error = new Error(message) as ApplicationError;
  error.severity = options.severity || ErrorSeverity.MEDIUM;
  error.code = options.code;
  error.context = options.context;
  error.userMessage = options.userMessage || 'An error occurred. Please try again later.';
  error.retry = options.retry;
  
  // Capture original stack if caused by another error
  if (options.cause && options.cause.stack) {
    error.stack = `${error.stack}\nCaused by: ${options.cause.stack}`;
  }
  
  return error;
}

/**
 * Extract useful error information
 */
export function getErrorDetails(error: any): {
  message: string;
  code?: string;
  userMessage: string;
  severity: ErrorSeverity;
} {
  // Handle ApplicationError instances
  if (error?.severity) {
    const appError = error as ApplicationError;
    return {
      message: appError.message,
      code: appError.code,
      userMessage: appError.userMessage || 'An error occurred. Please try again later.',
      severity: appError.severity,
    };
  }
  
  // Handle API errors
  if (error?.status || error?.statusCode) {
    const statusCode = error.status || error.statusCode;
    const isNetworkError = !statusCode;
    const isAuthError = statusCode === 401 || statusCode === 403;
    const isServerError = statusCode >= 500;
    
    // Assign severity based on status code
    let severity = ErrorSeverity.MEDIUM;
    if (isNetworkError || isServerError) severity = ErrorSeverity.HIGH;
    if (isAuthError) severity = ErrorSeverity.HIGH;
    
    // Extract message with fallbacks
    const message = 
      error.message || 
      error.error?.message || 
      error.body?.error?.message || 
      'Unknown API error';
      
    // Create user-friendly message based on status
    let userMessage = 'Something went wrong. Please try again later.';
    if (isNetworkError) userMessage = 'Network error. Please check your connection.';
    if (isAuthError) userMessage = 'Authentication error. Please log in again.';
    if (isServerError) userMessage = 'Server error. Our team has been notified.';
    
    return {
      message,
      code: statusCode ? `API_${statusCode}` : 'API_ERROR',
      userMessage,
      severity,
    };
  }
  
  // Default fallback for any other error
  return {
    message: error?.message || String(error) || 'Unknown error',
    userMessage: 'Something unexpected happened. Please try again.',
    severity: ErrorSeverity.MEDIUM,
  };
}

/**
 * React hook to handle errors in components
 */
export function useErrorHandler() {
  const { addToast } = useToast();
  const { trackError } = useAnalytics();

  const handleError = (error: any, options: {
    showToast?: boolean;
    logToAnalytics?: boolean;
    context?: Record<string, any>;
  } = {}) => {
    const { 
      showToast = true, 
      logToAnalytics = true,
      context = {}
    } = options;
    
    // Get standardized error details
    const errorDetails = getErrorDetails(error);
    
    // Log to console
    console.error('[Error]', errorDetails.message, error);
    
    // Display toast notification if requested
    if (showToast) {
      addToast({
        title: 'Error',
        message: errorDetails.userMessage,
        type: 'error',
        duration: 5000,
      });
    }
    
    // Track in analytics if requested
    if (logToAnalytics) {
      trackError(error, {
        ...context,
        errorCode: errorDetails.code,
        errorSeverity: errorDetails.severity,
      });
    }
    
    return errorDetails;
  };

  return { handleError };
}

export default useErrorHandler;