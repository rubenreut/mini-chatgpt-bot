import { useState } from 'react';
import { useMutation, QueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface AICompletionOptions {
  apiKey?: string;
  model?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error | AxiosError) => void;
}

interface AICompletionRequest {
  messages: Message[];
  files?: FileWithPreview[];
}

export function useAICompletion(options: AICompletionOptions = {}) {
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    type: string;
  } | null>(null);
  
  const apiKey = options.apiKey;
  const model = options.model || 'gpt-4';
  
  // Create the mutation for sending messages
  const mutation = useMutation({
    mutationFn: async (request: AICompletionRequest) => {
      if (!apiKey) {
        throw new Error('No API key provided. Please enter your OpenAI API key.');
      }
      
      const { messages, files = [] } = request;
      
      // Process text content from files if they exist
      let enhancedMessages = [...messages];
      
      if (files.length > 0) {
        // Get the last user message
        const lastUserMsgIndex = messages.findIndex(m => m.role === 'user');
        
        if (lastUserMsgIndex !== -1) {
          const userMsg = messages[lastUserMsgIndex];
          
          // Create file information to add to user message
          const fileList = files.map(file => 
            `- ${file.fileName} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)`
          ).join('\n');
          
          let fileContents = '';
          for (const file of files) {
            if (file.preview && !file.type.startsWith('image/')) {
              fileContents += `\n\n--------- CONTENT OF FILE: ${file.fileName} ---------\n`;
              fileContents += file.preview;
              fileContents += '\n----------- END OF FILE CONTENT -----------';
            } else {
              fileContents += `\n\n[${file.type.startsWith('image/') ? 'Image' : 'File'}: ${file.fileName}]`;
            }
          }
          
          // Add file information to the user message
          enhancedMessages[lastUserMsgIndex] = {
            ...userMsg,
            content: `${userMsg.content}\n\nAttached files:\n${fileList}${fileContents}`,
          };
        }
      }
      
      // Define retry mechanism with exponential backoff
      const maxRetries = 2;
      let retryCount = 0;
      
      while (retryCount <= maxRetries) {
        try {
          const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model,
              messages: enhancedMessages,
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 60000, // 60 second timeout
            }
          );
          
          return response.data.choices[0].message;
        } catch (error) {
          const axiosError = error as AxiosError;
          const status = axiosError.response?.status;
          
          // Determine if we should retry based on error type
          const shouldRetry = 
            !axiosError.response || // Network error
            axiosError.code === 'ECONNABORTED' || // Timeout
            status === 429 || // Rate limit
            (status && status >= 500); // Server error
          
          if (shouldRetry && retryCount < maxRetries) {
            retryCount++;
            // Exponential backoff with jitter
            const delay = Math.min(1000 * (2 ** retryCount) + Math.random() * 1000, 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // Process error before throwing
            const errorData = axiosError.response?.data as any;
            let errorMsg = 'An error occurred while connecting to OpenAI.';
            let errorType = 'UNKNOWN';
            
            if (!axiosError.response) {
              errorType = 'NETWORK';
              errorMsg = 'Network error. Please check your internet connection.';
            } else if (status === 401) {
              errorType = 'AUTH';
              errorMsg = 'Invalid API key. Please check your API key.';
            } else if (status === 429) {
              errorType = 'RATE_LIMIT';
              errorMsg = 'Too many requests. Please try again later.';
            } else if (status && status >= 500) {
              errorType = 'SERVER';
              errorMsg = 'OpenAI server error. Please try again later.';
            } else if (errorData?.error) {
              errorType = 'API';
              errorMsg = errorData.error.message || errorMsg;
            }
            
            setErrorDetails({ message: errorMsg, type: errorType });
            throw new Error(errorMsg);
          }
        }
      }
      
      throw new Error('Maximum retries exceeded');
    },
    onSuccess: options.onSuccess,
    onError: (error: Error | AxiosError) => {
      if (options.onError) {
        options.onError(error);
      }
    },
  });

  return {
    ...mutation,
    errorDetails,
    clearError: () => setErrorDetails(null),
  };
}
