import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, ErrorType } from '../shared/utils/errorTypes';
import { apiClient } from '../services/api/client';
import { chatService } from '../services/api/chatService';
import { Message, FileWithPreview } from '../shared/types';

interface UseChatServiceOptions {
  model?: string;
  onMessageReceived?: (message: Message) => void;
  onStreamChunk?: (chunk: Message) => void;
  onError?: (error: Error) => void;
}

/**
 * Enhanced hook for chat functionality with:
 * - Better error handling
 * - Streaming support
 * - Message normalization
 */
export function useChatService(options: UseChatServiceOptions = {}) {
  const queryClient = useQueryClient();
  const streamRef = useRef<boolean>(false);
  
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    type: ErrorType;
    code?: string;
  } | null>(null);
  
  // Get configured model or use default
  const model = options.model || 'gpt-4';
  
  // Set up mutation for sending messages
  const mutation = useMutation({
    mutationFn: async (request: {
      messages: Message[];
      apiKey: string;
      files?: FileWithPreview[];
      stream?: boolean;
    }) => {
      streamRef.current = !!request.stream;
      
      try {
        if (request.stream) {
          // Set API key for streaming requests
          apiClient.setApiKey(request.apiKey);
          
          // Handle streaming
          await chatService.streamChatCompletion(
            {
              messages: request.messages,
              model,
              files: request.files,
              stream: true
            },
            {
              onChunk: (chunk: Message) => {
                if (options.onStreamChunk) {
                  options.onStreamChunk(chunk);
                }
              },
              onComplete: (message: Message) => {
                if (options.onMessageReceived) {
                  options.onMessageReceived(message);
                }
              },
              onError: (error: any) => {
                handleChatError(error);
              }
            }
          );
          
          // Return null as we're handling the response via callbacks
          return null;
        } else {
          // Set API key for regular requests
          apiClient.setApiKey(request.apiKey);
          
          // Handle regular (non-streaming) request
          const response = await chatService.sendChatCompletion({
            messages: request.messages,
            model,
            files: request.files
          });
          
          if (options.onMessageReceived) {
            options.onMessageReceived(response);
          }
          
          return response;
        }
      } catch (error: any) {
        handleChatError(error);
        throw error;
      }
    },
    onError: (error: Error) => {
      console.error('Chat request error:', error);
      
      if (options.onError) {
        options.onError(error);
      }
    },
    onSettled: () => {
      // Update conversations cache if needed
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
  
  /**
   * Handle chat errors
   */
  const handleChatError = useCallback((error: any) => {
    const apiError = error as ApiError;
    let errorMsg = apiError.message || 'An error occurred';
    let errorType = apiError.type || ErrorType.UNKNOWN;
    let errorCode = apiError.statusCode?.toString();
    
    setErrorDetails({
      message: errorMsg,
      type: errorType,
      code: errorCode
    });
  }, []);
  
  /**
   * Cancel the current streaming request
   */
  const cancelRequest = useCallback(() => {
    if (streamRef.current) {
      chatService.cancelRequest();
      streamRef.current = false;
    }
  }, []);
  
  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setErrorDetails(null);
  }, []);
  
  return {
    ...mutation,
    errorDetails,
    clearError,
    cancelRequest,
    isStreaming: streamRef.current,
    isApiKeyError: errorDetails?.type === ErrorType.AUTH || errorDetails?.type === ErrorType.NO_API_KEY,
  };
}

export default useChatService;