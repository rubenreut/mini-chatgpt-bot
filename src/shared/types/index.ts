// Common types for the whole application

export interface Model {
  id: string;
  name: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  error?: boolean;
  errorType?: string;
  timestamp?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  systemPrompt?: string;
  timestamp?: number;
  createdAt?: string;
  lastUpdated?: string;
}

export interface FileData {
  name: string;
  type: string;
  size: number;
  lastModified?: number;
}

export interface MessageData {
  text?: string;
  files?: File[] | FileData[];
}

export interface FileWithPreview {
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
}

export type ErrorType = 'network' | 'auth' | 'ratelimit' | 'server' | 'unknown' | 'no_api_key';

export interface ApiError {
  type: ErrorType;
  message: string;
  original?: any;
}

export interface MutationContext {
  previousMessages?: Message[];
}