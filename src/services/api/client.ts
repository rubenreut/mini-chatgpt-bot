import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { storageService } from '../../shared/utils/storage';
import { ApiError, ErrorType, createApiError } from '../../shared/utils/errorTypes';

/**
 * Available API endpoints
 */
export enum ApiEndpoint {
  CHAT_COMPLETIONS = '/chat/completions',
  MODELS = '/models',
  EMBEDDINGS = '/embeddings',
  IMAGES = '/images/generations',
}

/**
 * API response cache configuration
 */
interface CacheConfig {
  enabled: boolean;
  ttl: number; // milliseconds
  key?: string;
}

/**
 * API request options
 */
export interface ApiRequestConfig extends AxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
  cache?: boolean | Partial<CacheConfig>;
  abortSignal?: AbortSignal;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  baseURL: 'https://api.openai.com/v1',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: 3,
  retryDelay: 1000,
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
  },
};

/**
 * In-memory cache for API responses
 */
const responseCache = new Map<string, { data: any; timestamp: number }>();

/**
 * API client with enhanced features:
 * - Automatic retries with exponential backoff
 * - Request caching
 * - Cancellation support
 * - Consistent error handling
 */
class ApiClient {
  private instance: AxiosInstance;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config: AxiosRequestConfig = {}) {
    this.instance = axios.create({
      ...DEFAULT_CONFIG,
      ...config,
    });

    // Add response interceptor for logging
    this.instance.interceptors.response.use(
      response => response,
      error => {
        if (axios.isCancel(error)) {
          const apiError = new Error('Request was cancelled') as ApiError;
          apiError.type = ErrorType.CANCELLED;
          apiError.originalError = error;
          return Promise.reject(apiError);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set the API key for authentication
   */
  setApiKey(apiKey: string): void {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    
    // Determine if we can persist storage long-term
    const canPersist = navigator.storage && typeof navigator.storage.persist === 'function';
    
    storageService.set('apiKey', apiKey, { 
      // Never expire the API key if we can persist storage, otherwise 24 hours
      expiry: canPersist ? 0 : 24 * 60 * 60 * 1000
    });
    
    // Try to persist storage if possible
    if (canPersist) {
      navigator.storage.persist().catch(() => {
        // If persistence fails, silently continue
      });
    }
  }

  /**
   * Clear the API key
   */
  clearApiKey(): void {
    delete this.instance.defaults.headers.common['Authorization'];
    storageService.remove('apiKey');
  }

  /**
   * Get the current API key
   */
  getApiKey(): string | undefined {
    const authHeader = this.instance.defaults.headers.common['Authorization'] as string;
    if (authHeader) {
      return authHeader.replace('Bearer ', '');
    }
    
    // Try to get from storage
    return storageService.get<string>('apiKey') || undefined;
  }

  /**
   * Create a cache key for a request
   */
  private createCacheKey(config: AxiosRequestConfig, customKey?: string): string {
    if (customKey) return customKey;
    
    const { method, url, params, data } = config;
    return JSON.stringify({ method, url, params, data });
  }

  /**
   * Check if a cached response is valid
   */
  private isCacheValid(cacheKey: string, ttl: number): boolean {
    const cached = responseCache.get(cacheKey);
    if (!cached) return false;
    
    // Calculate time elapsed
    return (Date.now() - cached.timestamp) < ttl;
  }

  /**
   * Get cached response
   */
  private getCachedResponse(cacheKey: string): any {
    const cached = responseCache.get(cacheKey);
    return cached?.data;
  }

  /**
   * Cache a response
   */
  private setCachedResponse(cacheKey: string, data: any): void {
    responseCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
    
    // Cleanup old cache entries periodically
    if (responseCache.size > 100) {
      this.cleanupCache();
    }
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    responseCache.forEach((value, key) => {
      if (now - value.timestamp > 30 * 60 * 1000) { // 30 minutes
        responseCache.delete(key);
      }
    });
  }

  /**
   * Process API errors into a standardized format
   */
  private handleApiError(error: any): ApiError {
    // Handle axios cancellation
    if (axios.isCancel(error)) {
      return createApiError('Request was cancelled', ErrorType.CANCELLED);
    }
    
    // Handle network errors
    if (!error.response) {
      return createApiError(
        'Network error. Please check your internet connection and try again.',
        ErrorType.NETWORK,
        undefined,
        error
      );
    }
    
    // Handle status code specific errors
    const status = error.response?.status;
    const errorData = {
      request: error.config,
      response: error.response?.data,
      originalError: error
    };
    
    switch (status) {
      case 401:
        return createApiError(
          'Invalid API key. Please check your API key and try again.',
          ErrorType.AUTH,
          status,
          errorData
        );
      case 429:
        return createApiError(
          'Rate limit exceeded. Please wait a moment before trying again.',
          ErrorType.RATE_LIMIT,
          status,
          errorData
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return createApiError(
          'Server error. Please try again later.',
          ErrorType.SERVER,
          status,
          errorData
        );
      default:
        return createApiError(
          error.response?.data?.error?.message || 
          error.response?.data?.message || 
          'An unknown error occurred',
          ErrorType.API,
          status,
          errorData
        );
    }
  }

  /**
   * Execute a request with retries, caching, and error handling
   */
  private async executeRequest<T>(
    config: AxiosRequestConfig,
    options: ApiRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    const {
      retry = DEFAULT_CONFIG.retry,
      retryDelay = DEFAULT_CONFIG.retryDelay,
      cache = DEFAULT_CONFIG.cache,
      abortSignal,
    } = options;

    // Process cache options
    const cacheConfig: CacheConfig = typeof cache === 'boolean'
      ? { enabled: cache, ttl: DEFAULT_CONFIG.cache.ttl as number }
      : { ...DEFAULT_CONFIG.cache as CacheConfig, ...(cache || {}) };
    
    // Check if we should use cache
    const cacheKey = this.createCacheKey(config, cacheConfig.key);
    if (cacheConfig.enabled && this.isCacheValid(cacheKey, cacheConfig.ttl)) {
      const cachedData = this.getCachedResponse(cacheKey);
      return Promise.resolve({ 
        data: cachedData,
        status: 304,
        statusText: 'Not Modified (Cached)',
        headers: {},
        config,
      } as AxiosResponse<T>);
    }
    
    // Setup cancellation
    let abortController: AbortController | undefined;
    if (abortSignal) {
      config.signal = abortSignal;
    } else {
      // Create a new abort controller for this request
      abortController = new AbortController();
      config.signal = abortController.signal;
      
      // Store the abort controller with a unique ID
      const requestId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      this.abortControllers.set(requestId, abortController);
      
      // Clean up after the request completes
      setTimeout(() => {
        this.abortControllers.delete(requestId);
      }, config.timeout || DEFAULT_CONFIG.timeout);
    }
    
    // Implement retry logic with exponential backoff
    let retries = 0;
    
    while (true) {
      try {
        const response = await this.instance.request<T>(config);
        
        // Cache the successful response if caching is enabled
        if (cacheConfig.enabled) {
          this.setCachedResponse(cacheKey, response.data);
        }
        
        return response;
      } catch (error: any) {
        // Don't retry if cancelled or max retries reached
        const isRetryable = 
          !axios.isCancel(error) && 
          (!error.response || // Network error
           error.code === 'ECONNABORTED' || // Timeout
           error.response?.status === 429 || // Rate limit
           (error.response?.status >= 500 && error.response?.status < 600)); // Server error
        
        if (!isRetryable || retries >= retry) {
          throw this.handleApiError(error);
        }
        
        // Exponential backoff with jitter
        const delay = Math.min(
          retryDelay * (2 ** retries) + Math.random() * 1000,
          30000 // Max 30 seconds
        );
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      }
    }
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    url: string,
    params?: any,
    options?: ApiRequestConfig
  ): Promise<T> {
    const response = await this.executeRequest<T>(
      { method: 'GET', url, params },
      options
    );
    return response.data;
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    options?: ApiRequestConfig
  ): Promise<T> {
    const response = await this.executeRequest<T>(
      { method: 'POST', url, data },
      options
    );
    return response.data;
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    options?: ApiRequestConfig
  ): Promise<T> {
    const response = await this.executeRequest<T>(
      { method: 'PUT', url, data },
      options
    );
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    url: string,
    options?: ApiRequestConfig
  ): Promise<T> {
    const response = await this.executeRequest<T>(
      { method: 'DELETE', url },
      options
    );
    return response.data;
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(reason?: string): void {
    this.abortControllers.forEach(controller => {
      controller.abort(reason || 'Cancelled by user');
    });
    this.abortControllers.clear();
  }

  /**
   * Clear the response cache
   */
  clearCache(): void {
    responseCache.clear();
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

export default apiClient;