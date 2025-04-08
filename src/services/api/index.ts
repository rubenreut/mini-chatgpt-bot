import { apiClient, ApiEndpoint } from './client';
import { chatService, type ChatCompletionRequest, type ChatCompletionStreamOptions } from './chatService';
import { ApiError, ErrorType } from '../../shared/utils/errorTypes';

// Export everything
export { 
  ApiEndpoint,
  type ApiError,
  ErrorType,
  type ChatCompletionRequest,
  type ChatCompletionStreamOptions
};

// Re-export all services from a single entry point
export default {
  api: apiClient,
  chat: chatService
};