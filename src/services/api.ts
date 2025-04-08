import axios, { AxiosError } from 'axios';

// Define base configuration for axios
const api = axios.create({
  baseURL: 'https://api.openai.com/v1',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface ChatCompletionRequest {
  messages: Message[];
  model: string;
}

export interface ApiError {
  message: string;
  type: ErrorType;
  statusCode?: number;
  originalError?: Error | AxiosError;
}

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  NO_API_KEY = 'NO_API_KEY',
  API = 'API',
  UNKNOWN = 'UNKNOWN',
}

// Helper function to handle API errors
const handleApiError = (error: any): ApiError => {
  if (!error.response) {
    // Network error
    return {
      type: ErrorType.NETWORK,
      message: 'Network error. Please check your internet connection and try again.',
      originalError: error,
    };
  } 
  
  const status = error.response?.status;
  
  if (status === 401) {
    return {
      type: ErrorType.AUTH,
      message: 'Invalid API key. Please check your API key and try again.',
      statusCode: status,
      originalError: error,
    };
  } 
  
  if (status === 429) {
    return {
      type: ErrorType.RATE_LIMIT,
      message: 'Rate limit exceeded. Please wait a moment before trying again.',
      statusCode: status,
      originalError: error,
    };
  } 
  
  if (status && status >= 500) {
    return {
      type: ErrorType.SERVER,
      message: 'OpenAI server error. Please try again later.',
      statusCode: status,
      originalError: error,
    };
  }
  
  const errorData = error.response?.data;
  return {
    type: ErrorType.API,
    message: errorData?.error?.message || 'Unknown API error occurred.',
    statusCode: status,
    originalError: error,
  };
};

// Retry logic with exponential backoff
const retryRequest = async <T>(
  requestFn: () => Promise<T>, 
  maxRetries = 2
): Promise<T> => {
  let retries = 0;
  
  while (true) {
    try {
      return await requestFn();
    } catch (error: any) {
      const isRetryable = 
        !error.response || // Network error
        error.code === 'ECONNABORTED' || // Timeout
        error.response?.status === 429 || // Rate limit
        (error.response?.status && error.response.status >= 500); // Server error
      
      if (!isRetryable || retries >= maxRetries) {
        throw handleApiError(error);
      }
      
      retries++;
      // Exponential backoff with jitter
      const delay = Math.min(1000 * (2 ** retries) + Math.random() * 1000, 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// API functions
export const chatCompletionService = {
  getChatCompletion: async (request: ChatCompletionRequest, apiKey: string) => {
    if (!apiKey) {
      throw {
        type: ErrorType.NO_API_KEY,
        message: 'No API key provided. Please enter your OpenAI API key.',
      };
    }
    
    api.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    
    return retryRequest(async () => {
      const response = await api.post('/chat/completions', {
        model: request.model,
        messages: request.messages,
      });
      
      return response.data.choices[0].message;
    });
  },
};

export default api;