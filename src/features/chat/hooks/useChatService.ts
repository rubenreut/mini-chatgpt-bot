import { useState, useCallback, useMemo } from 'react';
import { useMutation, UseMutationOptions } from 'react-query';
import { Message, ApiError, MutationContext } from '../../../shared/types';

// We're using the ErrorType from shared/types.ts
// This enum is just for internal reference
export enum ApiErrorType {
  NETWORK = 'network',
  AUTH = 'auth',
  RATELIMIT = 'ratelimit',
  SERVER = 'server',
  UNKNOWN = 'unknown',
  NO_API_KEY = 'no_api_key',
}

export interface ChatCompletionRequest {
  messages: Message[];
  model?: string;
  stream?: boolean;
  onUpdate?: (chunk: string) => void;
}

interface ChatServiceOptions {
  onSuccess?: (response: Message, variables: ChatCompletionRequest, context: unknown) => void;
  onError?: (error: ApiError, variables: ChatCompletionRequest, context: MutationContext | undefined) => void;
  onMutate?: (variables: ChatCompletionRequest) => Promise<MutationContext>;
  onSettled?: (data: Message | undefined, error: ApiError | null, variables: ChatCompletionRequest, context: MutationContext | undefined) => void;
  retries?: number;
  enabled?: boolean;
  apiKey?: string;
  model?: string;
}

/**
 * Custom hook for interacting with the OpenAI chat completion API with React Query
 */
export const useChatService = (options: ChatServiceOptions = {}) => {
  const { 
    onSuccess, 
    onError, 
    onMutate,
    onSettled,
    retries = 3, 
    apiKey = '',
    model = 'gpt-3.5-turbo'
  } = options;
  
  const [errorDetails, setErrorDetails] = useState<ApiError | null>(null);

  /**
   * Retry a failed request with exponential backoff
   */
  const retryRequest = useCallback(async <T>(
    fn: () => Promise<T>,
    retriesLeft = retries
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retriesLeft === 0) {
        throw error;
      }
      
      // Calculate backoff delay: 2^(maxRetries - retriesLeft) * 1000ms
      const delay = Math.pow(2, retries - retriesLeft) * 1000;
      console.log(`Request failed, retrying in ${delay}ms...`);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(retryRequest(fn, retriesLeft - 1));
        }, delay);
      });
    }
  }, [retries]);

  /**
   * Process API errors and return a structured ApiError object
   */
  const handleApiError = useCallback((error: any): ApiError => {
    console.error('API Error:', error);
    
    if (!error.response) {
      return {
        type: 'network',
        message: 'Network error. Please check your internet connection.',
        original: error,
      };
    }
    
    const { status } = error.response;
    
    if (status === 401) {
      return {
        type: 'auth',
        message: 'Invalid API key. Please check your OpenAI API key and try again.',
        original: error,
      };
    }
    
    if (status === 429) {
      return {
        type: 'ratelimit',
        message: 'Rate limit exceeded. Please try again later.',
        original: error,
      };
    }
    
    if (status >= 500) {
      return {
        type: 'server',
        message: 'OpenAI server error. Please try again later.',
        original: error,
      };
    }
    
    return {
      type: 'unknown',
      message: error.message ?? 'An unknown error occurred.',
      original: error,
    };
  }, []);

  /**
   * Send a request to the OpenAI chat completions API
   */
  const fetchChatCompletion = useCallback(async (
    request: ChatCompletionRequest
  ): Promise<Message> => {
    if (!apiKey) {
      const error: ApiError = {
        type: 'no_api_key',
        message: 'No API key provided. Please enter your OpenAI API key.',
      };
      
      setErrorDetails(error);
      throw error;
    }

    try {
      // If streaming is enabled, handle incrementally
      if (request.stream && request.onUpdate) {
        return await retryRequest(async () => {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          };
          
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: request.model ?? model,
              messages: request.messages.map(({ role, content }) => ({ role, content })),
              stream: true,
            }),
            signal: AbortSignal.timeout(30000), // 30 second timeout
          });
          
          if (!response.ok) {
            throw new Error(JSON.stringify({
              response: {
                status: response.status,
                data: await response.json(),
              }
            }));
          }
          
          if (!response.body) {
            throw new Error('Response body is null');
          }
          
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedContent = '';
          
          // Process the stream
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Decode the chunk
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk
              .split('\n')
              .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');
              
            for (const line of lines) {
              // Extract the data part from the SSE format
              const match = /^data: (.*)$/m.exec(line);
              if (!match) continue;
              
              try {
                const data = JSON.parse(match[1]);
                // Check if there's content in this chunk
                const content = data.choices?.[0]?.delta?.content;
                if (content && request.onUpdate) {
                  accumulatedContent += content;
                  // Call the update callback with the new content
                  request.onUpdate(content);
                }
              } catch (err) {
                console.error('Error parsing JSON from stream:', err);
              }
            }
          }
          
          // Return the complete message
          return {
            role: 'assistant',
            content: accumulatedContent,
          } as Message;
        });
      }
      
      // If not streaming, handle normally
      const response = await retryRequest(async () => {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        };
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: request.model ?? model,
            messages: request.messages.map(({ role, content }) => ({ role, content })),
          }),
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });
        
        if (!response.ok) {
          throw new Error(JSON.stringify({
            response: {
              status: response.status,
              data: await response.json(),
            }
          }));
        }
        
        return await response.json();
      });
      
      const message = response.choices[0].message as Message;
      return message;
    } catch (error: any) {
      const apiError = handleApiError(error);
      setErrorDetails(apiError);
      throw apiError;
    }
  }, [apiKey, model, retryRequest, handleApiError]);

  // Create mutation options with proper types
  const mutationOptions: UseMutationOptions<Message, ApiError, ChatCompletionRequest, MutationContext> = {
    onSuccess,
    onError,
    onMutate,
    onSettled,
    retry: retries,
  };

  // Use React Query's mutation hook for the chat completion request
  const mutation = useMutation<Message, ApiError, ChatCompletionRequest, MutationContext>(
    fetchChatCompletion,
    mutationOptions
  );

  // Helper to clear any stored errors
  const clearError = useCallback(() => {
    setErrorDetails(null);
  }, []);

  // Derived state values with useMemo to prevent unnecessary re-renders
  const isApiKeyError = useMemo(() => {
    return errorDetails?.type === 'auth' || errorDetails?.type === 'no_api_key';
  }, [errorDetails]);

  // Public API of the hook
  return {
    sendChatRequest: mutation.mutate,
    sendChatRequestAsync: mutation.mutateAsync,
    clearError,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error || errorDetails,
    data: mutation.data,
    isApiKeyError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

export default useChatService;