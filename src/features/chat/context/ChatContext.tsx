import React, { createContext, useContext, useEffect, useCallback, useReducer, useState } from 'react';
import { useQueryClient } from 'react-query';
import { rootReducer, ChatState } from '../state/rootReducer';
import { ActionType } from '../state/actionTypes';
import { useChatService, ChatCompletionRequest } from '../hooks/useChatService';
import speechSynthesis from '../../../utils/speechSynthesis';
import { Message, Conversation, FileData, MessageData, MutationContext, ApiError } from '../../../shared/types';

// Define the context type
interface ChatContextType {
  // Core state
  messages: Message[];
  loading: boolean;
  apiKey: string;
  showApiKeyModal: boolean;
  model: string;
  isStreaming: boolean;
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

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Hook to use chat context
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

// Initial state
const initialState: ChatState = {
  messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
  loading: false,
  apiKey: '',
  showApiKeyModal: false,
  model: 'gpt-4',
  conversations: [],
  activeConversationId: null,
  showConversationList: false,
  conversationTitle: 'New Conversation',
  systemPrompt: 'You are a helpful assistant.',
  showSystemPromptEditor: false,
  voiceEnabled: false,
  isListening: false,
  isSpeaking: false
};

// Simple in-memory cache for conversations to facilitate optimistic updates
class ConversationCache {
  private cache: Map<string, Conversation> = new Map();
  
  getAllConversations(): Conversation[] {
    try {
      // Load from localStorage
      const data = localStorage.getItem('mini_chatgpt_conversations');
      const storedConversations = data ? JSON.parse(data) : [];
      
      // Update cache with localStorage data
      storedConversations.forEach((convo: Conversation) => {
        this.cache.set(convo.id, convo);
      });
      
      // Return sorted conversations (newest first)
      return Array.from(this.cache.values())
        .sort((a, b) => {
          const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
          const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
          return dateB - dateA;
        });
    } catch (error) {
      console.error('Error retrieving conversations:', error);
      return Array.from(this.cache.values());
    }
  }
  
  getConversation(id: string): Conversation | null {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id) || null;
    }
    
    // Otherwise load from localStorage
    try {
      const data = localStorage.getItem('mini_chatgpt_conversations');
      const conversations = data ? JSON.parse(data) : [];
      const conversation = conversations.find((c: Conversation) => c.id === id);
      
      if (conversation) {
        this.cache.set(id, conversation);
      }
      
      return conversation || null;
    } catch (error) {
      console.error('Error retrieving conversation:', error);
      return null;
    }
  }
  
  getCurrentConversationId(): string | null {
    try {
      return localStorage.getItem('mini_chatgpt_current_conversation');
    } catch (error) {
      console.error('Error retrieving current conversation ID:', error);
      return null;
    }
  }
  
  setCurrentConversationId(id: string | null): void {
    if (id) {
      localStorage.setItem('mini_chatgpt_current_conversation', id);
    } else {
      localStorage.removeItem('mini_chatgpt_current_conversation');
    }
  }
  
  saveConversation(conversation: Conversation): string {
    try {
      const conversations = this.getAllConversations();
      const index = conversations.findIndex(c => c.id === conversation.id);
      const now = new Date().toISOString();
      
      let updatedConversation = {
        ...conversation,
        lastUpdated: now
      };
      
      if (index >= 0) {
        // Update existing conversation
        conversations[index] = updatedConversation;
        
        if (!updatedConversation.createdAt) {
          updatedConversation.createdAt = now;
        }
      } else {
        // Add new conversation
        if (!updatedConversation.id) {
          updatedConversation.id = this.generateId();
        }
        
        updatedConversation.createdAt = now;
        conversations.unshift(updatedConversation);
        
        // Limit the number of stored conversations
        const maxConversations = 50;
        if (conversations.length > maxConversations) {
          conversations.pop();
        }
      }
      
      // Update cache
      this.cache.set(updatedConversation.id, updatedConversation);
      
      // Persist to localStorage
      localStorage.setItem('mini_chatgpt_conversations', JSON.stringify(conversations));
      
      return updatedConversation.id;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return conversation.id || '';
    }
  }
  
  deleteConversation(id: string): boolean {
    try {
      // Remove from cache
      this.cache.delete(id);
      
      // Update localStorage
      const data = localStorage.getItem('mini_chatgpt_conversations');
      let conversations = data ? JSON.parse(data) : [];
      conversations = conversations.filter((c: Conversation) => c.id !== id);
      localStorage.setItem('mini_chatgpt_conversations', JSON.stringify(conversations));
      
      // If deleted the current conversation, clear the reference
      const currentId = this.getCurrentConversationId();
      if (currentId === id) {
        localStorage.removeItem('mini_chatgpt_current_conversation');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }
  
  updateTitle(id: string, title: string): boolean {
    const conversation = this.getConversation(id);
    if (conversation) {
      conversation.title = title;
      this.saveConversation(conversation);
      return true;
    }
    return false;
  }
  
  updateSystemPrompt(id: string, systemPrompt: string): boolean {
    const conversation = this.getConversation(id);
    if (conversation) {
      // Find and update the system message
      const hasSystemMessage = conversation.messages.some(msg => msg.role === 'system');
      
      if (hasSystemMessage) {
        conversation.messages = conversation.messages.map(msg => 
          msg.role === 'system' ? { ...msg, content: systemPrompt } : msg
        );
      } else {
        conversation.messages.unshift({ role: 'system', content: systemPrompt });
      }
      
      this.saveConversation(conversation);
      return true;
    }
    return false;
  }
  
  createNewConversation(systemPrompt: string = 'You are a helpful assistant.'): Conversation {
    const id = this.generateId();
    const newConversation: Conversation = {
      id,
      title: 'New Conversation',
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    this.saveConversation(newConversation);
    this.setCurrentConversationId(id);
    
    return newConversation;
  }
  
  // Generate a unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // Create React Query client
  const queryClient = useQueryClient();
  
  // Create conversation cache using useMemo to prevent recreation on each render
  const conversationCache = React.useMemo(() => new ConversationCache(), []);
  
  // Track streaming state
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  
  // Use reducer for state management
  const [state, dispatch] = useReducer(rootReducer, {
    ...initialState,
    showApiKeyModal: !localStorage.getItem('openai_api_key')
  });

  // Initialize React Query service with optimistic updates
  const chatService = useChatService({
    apiKey: state.apiKey,
    model: state.model,
    onMutate: async (variables: ChatCompletionRequest) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['conversations']);
      
      // Snapshot the previous value
      const previousMessages = state.messages;
      
      // Optimistically update to the new value
      const optimisticResponse: Message = {
        role: 'assistant',
        content: 'Thinking...',
        timestamp: Date.now()
      };
      
      dispatch({ type: ActionType.ADD_MESSAGE, payload: optimisticResponse });
      
      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onSuccess: (reply) => {
      // Reset streaming state if we were streaming
      if (isStreaming) {
        setIsStreaming(false);
      }
      
      // If we weren't streaming, update with the actual response
      // Otherwise, the streaming updates have already been applied
      if (!isStreaming) {
        // Get all messages before the assistant response and add the new reply
        // This is more robust than using slice to ensure we don't lose messages
        const userMessages = state.messages.filter(msg => msg.role === 'user' || msg.role === 'system');
        const assistantMessages = state.messages.filter(msg => msg.role === 'assistant');
        
        // Create a new messages array preserving all user messages
        // And replacing only the last assistant message if it exists
        let allMessages: Message[];
        
        if (assistantMessages.length > 0) {
          // Remove the last assistant message (the optimistic one)
          const assistantWithoutLast = assistantMessages.slice(0, -1);
          // Combine user messages, existing assistant messages, and the new reply
          allMessages = [...userMessages, ...assistantWithoutLast, reply];
        } else {
          // Just add the reply to existing messages
          allMessages = [...userMessages, reply];
        }
        
        // Add console logging to debug message count
        console.log("onSuccess handler - all messages:", allMessages.length);
        console.log("User messages:", allMessages.filter(m => m.role === 'user').length);
        console.log("Assistant messages:", allMessages.filter(m => m.role === 'assistant').length);
        
        dispatch({ 
          type: ActionType.SET_MESSAGES, 
          payload: allMessages
        });
      }
      
      dispatch({ type: ActionType.SET_LOADING, payload: false });
      
      // Save to conversation cache with the final reply
      if (state.activeConversationId) {
        let messagesToSave: Message[];
        
        if (isStreaming) {
          // For streaming, make sure we have all user messages plus the final assistant message
          const userAndSystemMessages = state.messages.filter(msg => msg.role === 'user' || msg.role === 'system');
          const assistantMessages = state.messages.filter(msg => msg.role === 'assistant');
          
          // Replace the last assistant message with the final reply
          if (assistantMessages.length > 0) {
            const assistantWithoutLast = assistantMessages.slice(0, -1);
            const finalReply = { ...reply, content: streamingResponse };
            messagesToSave = [...userAndSystemMessages, ...assistantWithoutLast, finalReply];
          } else {
            messagesToSave = [...userAndSystemMessages, { ...reply, content: streamingResponse }];
          }
        } else {
          // If not streaming, just use the state.messages which already contains the reply
          messagesToSave = state.messages;
        }
        
        // Log message counts before saving  
        console.log("Saving conversation - messages:", messagesToSave.length);
        console.log("User messages:", messagesToSave.filter(m => m.role === 'user').length);
        console.log("Assistant messages:", messagesToSave.filter(m => m.role === 'assistant').length);
        
        saveCurrentConversation(messagesToSave);
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries(['conversations']);
    },
    onError: (error: ApiError, variables: ChatCompletionRequest, context: MutationContext | undefined) => {
      // Reset streaming state if we were streaming
      if (isStreaming) {
        setIsStreaming(false);
        setStreamingResponse('');
      }
      
      // Revert to previous state if there's an error
      if (context?.previousMessages) {
        dispatch({ type: ActionType.SET_MESSAGES, payload: context.previousMessages });
      }
      
      // Add error message
      dispatch({ 
        type: ActionType.ADD_MESSAGE, 
        payload: {
          role: 'assistant',
          content: `⚠️ Error: ${error?.message ?? 'Unknown error'}`,
          error: true,
          errorType: error?.type
        }
      });
      
      dispatch({ type: ActionType.SET_LOADING, payload: false });
      
      // Handle API key errors by showing the API key modal
      if (error?.type === 'auth' || error?.type === 'no_api_key') {
        setTimeout(() => dispatch({ type: ActionType.TOGGLE_API_KEY_MODAL, payload: true }), 0);
      }
    },
    onSettled: (data: Message | undefined, error: ApiError | null, variables: ChatCompletionRequest, context: MutationContext | undefined) => {
      // Always refetch after error or success
      queryClient.invalidateQueries(['conversations']);
    }
  });
  
  // Initialize speech synthesis
  useEffect(() => {
    if (speechSynthesis.isSupported()) {
      speechSynthesis.init();
    }
  }, []);
  
  // Load preferences from localStorage
  useEffect(() => {
    const savedModel = localStorage.getItem('selected_model');
    if (savedModel) {
      dispatch({ type: ActionType.SET_MODEL, payload: savedModel });
    }
    
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      dispatch({ type: ActionType.SET_API_KEY, payload: savedApiKey });
    }
    
    const voiceEnabledSetting = localStorage.getItem('voice_enabled');
    if (voiceEnabledSetting !== null) {
      dispatch({ type: ActionType.TOGGLE_VOICE_ENABLED, payload: voiceEnabledSetting === 'true' });
    }
  }, []);
  
  // Load conversations and set active conversation
  useEffect(() => {
    const allConversations = conversationCache.getAllConversations();
    dispatch({ type: ActionType.UPDATE_CONVERSATIONS, payload: allConversations });
    
    const currentId = conversationCache.getCurrentConversationId();
    if (currentId && allConversations.some(c => c.id === currentId)) {
      loadConversation(currentId);
    } else if (allConversations.length > 0) {
      // If no current ID or it's invalid, use the most recent conversation
      loadConversation(allConversations[0].id);
    } else {
      // If no conversations exist, create a new one
      createNewConversation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Save model preference to localStorage
  useEffect(() => {
    localStorage.setItem('selected_model', state.model);
  }, [state.model]);
  
  // Save voice preference to localStorage
  useEffect(() => {
    localStorage.setItem('voice_enabled', state.voiceEnabled.toString());
  }, [state.voiceEnabled]);
  
  // Load a specific conversation
  const loadConversation = useCallback((id: string) => {
    const conversation = conversationCache.getConversation(id);
    if (conversation) {
      // Get system prompt
      const systemMsg = conversation.messages.find(msg => msg.role === 'system');
      const systemPromptContent = systemMsg ? systemMsg.content : state.systemPrompt;
      
      dispatch({ 
        type: ActionType.SET_ACTIVE_CONVERSATION,
        payload: {
          id,
          messages: conversation.messages,
          title: conversation.title,
          systemPrompt: systemPromptContent
        }
      });
      
      conversationCache.setCurrentConversationId(id);
    }
  }, [state.systemPrompt, conversationCache]);
  
  // Create a new conversation
  const createNewConversation = useCallback(() => {
    const newConvo = conversationCache.createNewConversation(state.systemPrompt);
    
    dispatch({ 
      type: ActionType.SET_ACTIVE_CONVERSATION,
      payload: {
        id: newConvo.id,
        messages: newConvo.messages,
        title: newConvo.title,
        systemPrompt: state.systemPrompt
      }
    });
    
    // Refresh conversation list
    dispatch({ 
      type: ActionType.UPDATE_CONVERSATIONS, 
      payload: conversationCache.getAllConversations() 
    });
    
    return newConvo.id;
  }, [state.systemPrompt, conversationCache]);
  
  // Delete a conversation
  const deleteConversation = useCallback((id: string) => {
    // Optimistic update for UI responsiveness
    const previousConversations = state.conversations;
    const filteredConversations = previousConversations.filter(c => c.id !== id);
    
    dispatch({ type: ActionType.UPDATE_CONVERSATIONS, payload: filteredConversations });
    
    try {
      // Actually delete the conversation
      conversationCache.deleteConversation(id);
      
      // Handle active conversation if deleted
      if (id === state.activeConversationId) {
        const allConversations = conversationCache.getAllConversations();
        if (allConversations.length > 0) {
          loadConversation(allConversations[0].id);
        } else {
          createNewConversation();
        }
      }
    } catch (error) {
      // Revert on error
      console.error('Error deleting conversation:', error);
      dispatch({ type: ActionType.UPDATE_CONVERSATIONS, payload: previousConversations });
    }
  }, [state.activeConversationId, state.conversations, loadConversation, createNewConversation, conversationCache]);
  
  // Update conversation title with optimistic updates
  const updateConversationTitle = useCallback((title: string) => {
    if (!state.activeConversationId) return;
    
    // Store previous state for potential rollback
    const previousTitle = state.conversationTitle;
    const previousConversations = state.conversations;
    
    // Optimistic update
    dispatch({ type: ActionType.SET_CONVERSATION_TITLE, payload: title });
    
    // Create optimistic update for conversations list
    const updatedConversations = state.conversations.map(convo => 
      convo.id === state.activeConversationId 
        ? { ...convo, title } 
        : convo
    );
    
    dispatch({ type: ActionType.UPDATE_CONVERSATIONS, payload: updatedConversations });
    
    try {
      // Actually update the title
      conversationCache.updateTitle(state.activeConversationId, title);
    } catch (error) {
      // Revert on error
      console.error('Error updating title:', error);
      dispatch({ type: ActionType.SET_CONVERSATION_TITLE, payload: previousTitle });
      dispatch({ type: ActionType.UPDATE_CONVERSATIONS, payload: previousConversations });
    }
  }, [state.activeConversationId, state.conversationTitle, state.conversations, conversationCache]);
  
  // Update system prompt
  const updateSystemPrompt = useCallback((prompt: string) => {
    // Store previous state for potential rollback
    const previousPrompt = state.systemPrompt;
    const previousMessages = state.messages;
    
    // Optimistic update
    dispatch({ type: ActionType.SET_SYSTEM_PROMPT, payload: prompt });
    
    try {
      // Update in storage if we have an active conversation
      if (state.activeConversationId) {
        conversationCache.updateSystemPrompt(state.activeConversationId, prompt);
      }
    } catch (error) {
      // Revert on error
      console.error('Error updating system prompt:', error);
      dispatch({ type: ActionType.SET_SYSTEM_PROMPT, payload: previousPrompt });
      dispatch({ type: ActionType.SET_MESSAGES, payload: previousMessages });
    }
    
    dispatch({ type: ActionType.TOGGLE_SYSTEM_PROMPT_EDITOR, payload: false });
  }, [state.activeConversationId, state.systemPrompt, state.messages, conversationCache]);
  
  // Save current messages to active conversation
  const saveCurrentConversation = useCallback((messages = state.messages) => {
    if (!state.activeConversationId || messages.length <= 1) return;
    
    const conversation: Conversation = {
      id: state.activeConversationId,
      title: state.conversationTitle,
      messages
    };
    
    conversationCache.saveConversation(conversation);
    dispatch({ 
      type: ActionType.UPDATE_CONVERSATIONS, 
      payload: conversationCache.getAllConversations() 
    });
  }, [state.activeConversationId, state.conversationTitle, state.messages, conversationCache]);
  
  // Auto-save on messages change
  useEffect(() => {
    if (state.messages.length > 1 && state.activeConversationId) {
      saveCurrentConversation();
    }
  }, [state.messages, saveCurrentConversation, state.activeConversationId]);
  
  // Text-to-speech for assistant responses
  useEffect(() => {
    if (!state.voiceEnabled || !speechSynthesis.isSupported()) return;
    
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !state.loading) {
      dispatch({ type: ActionType.SET_SPEAKING, payload: true });
      
      // Remove markdown and code blocks for better speech
      const textToSpeak = lastMessage.content
        .replace(/```[\s\S]*?```/g, 'Code block omitted for speech.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/#{1,6}\s+(.+)/g, '$1')
        .replace(/>([^<]+)/g, '$1');
      
      speechSynthesis.speak(textToSpeak, {
        onEnd: () => dispatch({ type: ActionType.SET_SPEAKING, payload: false }),
        onError: () => dispatch({ type: ActionType.SET_SPEAKING, payload: false })
      });
    }
    
    return () => {
      if (state.isSpeaking) {
        speechSynthesis.stop();
        dispatch({ type: ActionType.SET_SPEAKING, payload: false });
      }
    };
  }, [state.messages, state.loading, state.voiceEnabled, state.isSpeaking]);
  
  // Process files for the message
  const processFiles = async (files: File[] | FileData[]): Promise<Array<{name: string, content: string}>> => {
    // Process files to extract content for the LLM - batching requests for better performance
    const batchSize = 3; // Process 3 files at a time
    const batches = [];
    const allFileContents = [];
    
    // Create batches of files
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    
    // Process each batch sequentially
    for (const batch of batches) {
      const fileContents = await Promise.all(batch.map(async (file) => {
        try {
          // Create a Promise wrapper around FileReader
          const readFileAsText = (file: File) => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(reader.error);
              
              // Read file based on type
              if (file.type.startsWith('text/') || 
                  file.type === 'application/json' || 
                  file.name.endsWith('.md') || 
                  file.name.endsWith('.txt') ||
                  file.name.endsWith('.csv') ||
                  file.name.endsWith('.js') ||
                  file.name.endsWith('.jsx') ||
                  file.name.endsWith('.ts') ||
                  file.name.endsWith('.tsx') ||
                  file.name.endsWith('.py') ||
                  file.name.endsWith('.html') ||
                  file.name.endsWith('.css')) {
                // For large files, limit reading to first megabyte
                if (file.size > 1024 * 1024) {
                  reader.readAsText(file.slice(0, 1024 * 1024));
                } else {
                  reader.readAsText(file);
                }
              } else if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
              } else {
                resolve(`[File content not directly accessible. This file type (${file.type}) requires specialized processing.]`);
              }
            });
          };
          
          // Read the file and return formatted content
          const content = await readFileAsText(file as File);
          return {
            name: file.name,
            content
          };
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error);
          return {
            name: file.name,
            content: `Error reading file: ${(error as Error).message}`
          };
        }
      }));
      
      allFileContents.push(...fileContents);
    }
    
    return allFileContents;
  };
  
  // Send message to API with optimistic updates
  const sendMessage = useCallback(async (messageData: MessageData) => {
    const userText = messageData.text || '';
    const files = messageData.files || [];
    
    if (!userText.trim() && files.length === 0) return;
    
    console.log("Current message count:", state.messages.length);
    
    // Check if API key is available
    if (!state.apiKey.trim()) {
      dispatch({ type: ActionType.TOGGLE_API_KEY_MODAL, payload: true });
      return;
    }
    
    // Stop any ongoing speech
    if (state.isSpeaking) {
      speechSynthesis.stop();
      dispatch({ type: ActionType.SET_SPEAKING, payload: false });
    }

    // Create message content with file info if needed
    let userContent = userText;
    
    // If there are files, add file information to the message
    if (files.length > 0) {
      const fileList = files.map((file: File | FileData) => 
        `- ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)`
      ).join('\n');
      
      // Add file info to user message
      userContent += userContent ? '\n\n' : '';
      userContent += `Attached files:\n${fileList}`;
      
      // Process file contents
      const fileContents = await processFiles(files);
      
      // Add all file contents to the message
      for (const fileContent of fileContents) {
        userContent += `\n\n--------- CONTENT OF FILE: ${fileContent.name} ---------\n${fileContent.content}\n----------- END OF FILE CONTENT -----------`;
      }
    }

    // Add the user message to state with timestamp for stability
    const userMessage: Message = { 
      role: 'user', 
      content: userContent,
      timestamp: Date.now() // Add timestamp for key stability
    };
    
    console.log("Adding user message:", userMessage.content.substring(0, 30));
    dispatch({ type: ActionType.ADD_MESSAGE, payload: userMessage });
    dispatch({ type: ActionType.SET_LOADING, payload: true });

    // Create a new array with all messages including the new user message
    const newMessages = [...state.messages, userMessage];
    console.log("newMessages length:", newMessages.length);
    console.log("User messages count:", newMessages.filter(m => m.role === 'user').length);

    // If first message in the conversation, update title automatically
    // CRITICAL: We keep the user message in the message list
    if (state.messages.filter(msg => msg.role === 'user').length === 0) {
      const title = userText?.length > 30 
        ? userText.substring(0, 27) + '...' 
        : userText ?? 'File upload';
      
      // Optimistically update title
      updateConversationTitle(title);
      console.log("Updated conversation title:", title);
    }

    // Reset streaming state
    setStreamingResponse('');
    setIsStreaming(true);
    console.log("Starting new message, current messages:", state.messages.length);

    // Add an initial streaming message
    const initialStreamingMessage: Message = { 
      role: 'assistant', 
      content: '' 
    };
    dispatch({ type: ActionType.ADD_MESSAGE, payload: initialStreamingMessage });

    // Define streaming update handler
    const handleStreamUpdate = (chunk: string) => {
      // Properly handle the streaming updates with a callback
      setStreamingResponse(prev => {
        const newContent = prev + chunk;
        
        // Update the message with current streaming content
        const updatedMessage: Message = {
          role: 'assistant',
          content: newContent,
          timestamp: Date.now() // Add timestamp for better key management
        };
        
        // PRESERVE ALL PREVIOUS MESSAGES including user messages
        // We check how many messages are there and update only the last one (assistant)
        const currentMessages = [...state.messages];
        
        // Check if the last message is an assistant message
        if (currentMessages.length > 0 && 
            currentMessages[currentMessages.length - 1].role === 'assistant') {
          // Just update the last message's content
          currentMessages[currentMessages.length - 1] = updatedMessage;
        } else {
          // Add the assistant message if there isn't one at the end
          currentMessages.push(updatedMessage);
        }
        
        // Validate message counts before dispatch
        const userCount = currentMessages.filter(m => m.role === 'user').length;
        const assistantCount = currentMessages.filter(m => m.role === 'assistant').length;
        
        console.log(`Streaming update, user: ${userCount}, assistant: ${assistantCount}`);
        console.log("Total messages to update:", currentMessages.length);
        
        dispatch({ 
          type: ActionType.SET_MESSAGES, 
          payload: currentMessages
        });
        
        return newContent;
      });
    };

    // Use React Query mutation to send the message with streaming
    chatService.sendChatRequest({
      messages: newMessages,
      model: state.model,
      stream: true,
      onUpdate: handleStreamUpdate
    });
    
  }, [state.messages, state.isSpeaking, state.apiKey, state.model, chatService, updateConversationTitle, streamingResponse]);
  
  // Handle API key submission
  const handleApiKeySubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (state.apiKey?.trim() && state.apiKey.startsWith('sk-')) {
      // Store API key in localStorage (client-side only)
      // Note: In production, consider a more secure approach using a backend
      localStorage.setItem('openai_api_key', state.apiKey);
      dispatch({ type: ActionType.TOGGLE_API_KEY_MODAL, payload: false });
    }
  }, [state.apiKey]);
  
  // Voice input handler - defined after sendMessage to avoid 'used before defined' warning
  const handleVoiceInput = useCallback((transcript: string) => {
    if (transcript) {
      sendMessage({ text: transcript, files: [] });
      dispatch({ type: ActionType.SET_LISTENING, payload: false });
    }
  }, [sendMessage]);
  
  // Clear current conversation
  const clearConversation = useCallback(() => {
    // Keep the system message, clear everything else
    const systemMsg = state.messages.find(msg => msg.role === 'system') ?? 
                      { role: 'system', content: state.systemPrompt ?? 'You are a helpful assistant.' };
    
    dispatch({ type: ActionType.SET_MESSAGES, payload: [systemMsg] });
    createNewConversation();
  }, [state.messages, state.systemPrompt, createNewConversation]);
  
  // Export current conversation
  const exportConversation = useCallback(() => {
    const conversationText = state.messages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
    
    const fileName = (state.conversationTitle ?? 'conversation').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.messages, state.conversationTitle]);
  
  // Toggle voice features
  const toggleVoiceFeatures = useCallback(() => {
    if (!state.voiceEnabled && !speechSynthesis.isSupported()) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }
    
    dispatch({ type: ActionType.TOGGLE_VOICE_ENABLED, payload: !state.voiceEnabled });
  }, [state.voiceEnabled]);

  // Action dispatchers for components - using useCallback for performance
  const setApiKey = useCallback((value: string) => {
    dispatch({ type: ActionType.SET_API_KEY, payload: value });
  }, []);

  const setShowApiKeyModal = useCallback((value: boolean) => {
    dispatch({ type: ActionType.TOGGLE_API_KEY_MODAL, payload: value });
  }, []);

  const setModel = useCallback((value: string) => {
    dispatch({ type: ActionType.SET_MODEL, payload: value });
  }, []);

  const setShowConversationList = useCallback((value: boolean) => {
    dispatch({ type: ActionType.SET_CONVERSATION_LIST_VISIBILITY, payload: value });
  }, []);

  const setShowSystemPromptEditor = useCallback((value: boolean) => {
    dispatch({ type: ActionType.TOGGLE_SYSTEM_PROMPT_EDITOR, payload: value });
  }, []);

  const setIsListening = useCallback((value: boolean) => {
    dispatch({ type: ActionType.SET_LISTENING, payload: value });
  }, []);

  // Define the context value with all required properties
  const contextValue: ChatContextType = {
    // Core state
    messages: state.messages,
    loading: state.loading,
    apiKey: state.apiKey,
    showApiKeyModal: state.showApiKeyModal,
    model: state.model,
    isStreaming,
    setApiKey,
    setShowApiKeyModal,
    sendMessage,
    handleApiKeySubmit,
    setModel,
    
    // Conversation management
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    showConversationList: state.showConversationList,
    setShowConversationList,
    loadConversation,
    createNewConversation,
    deleteConversation,
    
    // Conversation details
    conversationTitle: state.conversationTitle,
    updateConversationTitle,
    clearConversation,
    exportConversation,
    
    // System prompt
    systemPrompt: state.systemPrompt,
    showSystemPromptEditor: state.showSystemPromptEditor, 
    setShowSystemPromptEditor,
    updateSystemPrompt,
    
    // Voice features
    isListening: state.isListening,
    setIsListening,
    handleVoiceInput,
    isSpeaking: state.isSpeaking,
    voiceEnabled: state.voiceEnabled,
    toggleVoiceFeatures
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};