import { useMutation } from '@tanstack/react-query';
import { chatCompletionService, ApiError, ErrorType } from '../services/api';
import { useState } from 'react';

interface ChatServiceOptions {
  onSuccess?: (response: Message) => void;
  onError?: (error: ApiError) => void;
}

export function useChatService(options: ChatServiceOptions = {}) {
  const [errorDetails, setErrorDetails] = useState<ApiError | null>(null);
  
  const mutation = useMutation({
    mutationFn: async ({ 
      messages, 
      apiKey, 
      model = 'gpt-4' 
    }: { 
      messages: Message[]; 
      apiKey: string; 
      model: string;
    }) => {
      try {
        return await chatCompletionService.getChatCompletion({ messages, model }, apiKey);
      } catch (error) {
        const apiError = error as ApiError;
        setErrorDetails(apiError);
        throw apiError;
      }
    },
    onSuccess: (data) => {
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: ApiError) => {
      if (options.onError) {
        options.onError(error);
      }
    },
  });

  return {
    ...mutation,
    errorDetails,
    clearError: () => setErrorDetails(null),
    isApiKeyError: errorDetails?.type === ErrorType.AUTH || errorDetails?.type === ErrorType.NO_API_KEY,
  };
}

export default useChatService;