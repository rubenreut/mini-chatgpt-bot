export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  error?: boolean;
  errorType?: string;
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
  content?: string;
}

export interface MessageData {
  text: string;
  files: File[] | FileData[];
}

export interface ChatState {
  messages: Message[];
  loading: boolean;
  apiKey: string;
  showApiKeyModal: boolean;
  model: string;
  conversations: Conversation[];
  activeConversationId: string | null;
  showConversationList: boolean;
  conversationTitle: string;
  systemPrompt: string;
  showSystemPromptEditor: boolean;
  voiceEnabled: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}

export enum ActionType {
  SET_MESSAGES = 'SET_MESSAGES',
  ADD_MESSAGE = 'ADD_MESSAGE',
  SET_LOADING = 'SET_LOADING',
  SET_MODEL = 'SET_MODEL',
  TOGGLE_API_KEY_MODAL = 'TOGGLE_API_KEY_MODAL',
  SET_API_KEY = 'SET_API_KEY',
  SET_CONVERSATION_LIST_VISIBILITY = 'SET_CONVERSATION_LIST_VISIBILITY',
  SET_ACTIVE_CONVERSATION = 'SET_ACTIVE_CONVERSATION',
  UPDATE_CONVERSATIONS = 'UPDATE_CONVERSATIONS',
  SET_CONVERSATION_TITLE = 'SET_CONVERSATION_TITLE',
  TOGGLE_SYSTEM_PROMPT_EDITOR = 'TOGGLE_SYSTEM_PROMPT_EDITOR',
  SET_SYSTEM_PROMPT = 'SET_SYSTEM_PROMPT',
  TOGGLE_VOICE_ENABLED = 'TOGGLE_VOICE_ENABLED',
  SET_LISTENING = 'SET_LISTENING',
  SET_SPEAKING = 'SET_SPEAKING'
}

export type Action =
  | { type: ActionType.SET_MESSAGES; payload: Message[] }
  | { type: ActionType.ADD_MESSAGE; payload: Message }
  | { type: ActionType.SET_LOADING; payload: boolean }
  | { type: ActionType.SET_MODEL; payload: string }
  | { type: ActionType.TOGGLE_API_KEY_MODAL; payload: boolean }
  | { type: ActionType.SET_API_KEY; payload: string }
  | { type: ActionType.SET_CONVERSATION_LIST_VISIBILITY; payload: boolean }
  | { 
      type: ActionType.SET_ACTIVE_CONVERSATION; 
      payload: { 
        id: string; 
        messages: Message[]; 
        title: string; 
        systemPrompt: string 
      } 
    }
  | { type: ActionType.UPDATE_CONVERSATIONS; payload: Conversation[] }
  | { type: ActionType.SET_CONVERSATION_TITLE; payload: string }
  | { type: ActionType.TOGGLE_SYSTEM_PROMPT_EDITOR; payload: boolean }
  | { type: ActionType.SET_SYSTEM_PROMPT; payload: string }
  | { type: ActionType.TOGGLE_VOICE_ENABLED; payload: boolean }
  | { type: ActionType.SET_LISTENING; payload: boolean }
  | { type: ActionType.SET_SPEAKING; payload: boolean };

export interface ChatContextType {
  // Core state
  messages: Message[];
  loading: boolean;
  apiKey: string;
  showApiKeyModal: boolean;
  model: string;
  setApiKey: (value: string) => void;
  setShowApiKeyModal: (value: boolean) => void;
  sendMessage: (messageData: MessageData) => Promise<void>;
  handleApiKeySubmit: (e: React.FormEvent) => void;
  setModel: (value: string) => void;
  
  // Conversation management
  conversations: Conversation[];
  activeConversationId: string | null;
  showConversationList: boolean;
  setShowConversationList: (value: boolean) => void;
  loadConversation: (id: string) => void;
  createNewConversation: () => string;
  deleteConversation: (id: string) => void;
  
  // Conversation details
  conversationTitle: string;
  updateConversationTitle: (title: string) => void;
  clearConversation: () => void;
  exportConversation: () => void;
  
  // System prompt
  systemPrompt: string;
  showSystemPromptEditor: boolean;
  setShowSystemPromptEditor: (value: boolean) => void;
  updateSystemPrompt: (prompt: string) => void;
  
  // Voice features
  isListening: boolean;
  setIsListening: (value: boolean) => void;
  handleVoiceInput: (transcript: string) => void;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  toggleVoiceFeatures: () => void;
}

// Web Speech API types
declare global {
  interface Window {
    handleVoiceTranscript?: (text: string) => void;
  }
}

export interface FileWithPreview extends File {
  id: string;
  fileName: string;
  lineCount?: number | null;
  preview?: string;
}