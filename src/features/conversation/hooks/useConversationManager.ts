import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '../../../shared/types';

interface ConversationManagerOptions {
  maxConversations?: number;
  defaultSystemPrompt?: string;
}

/**
 * Custom hook for managing conversations in local storage
 */
export const useConversationManager = (options: ConversationManagerOptions = {}) => {
  const {
    maxConversations = 50,
    defaultSystemPrompt = 'You are a helpful assistant.'
  } = options;

  const storageKey = 'mini_chatgpt_conversations';
  const currentConversationKey = 'mini_chatgpt_current_conversation';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // Generate a unique ID
  const generateId = useCallback((): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }, []);

  // Load conversations from local storage
  const loadConversations = useCallback((): Conversation[] => {
    try {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving conversations:', error);
      return [];
    }
  }, [storageKey]);

  // Load current conversation ID from local storage
  const loadCurrentConversationId = useCallback((): string | null => {
    try {
      return localStorage.getItem(currentConversationKey);
    } catch (error) {
      console.error('Error retrieving current conversation ID:', error);
      return null;
    }
  }, [currentConversationKey]);

  // Save conversations to local storage
  const saveConversationsToStorage = useCallback((convos: Conversation[]): void => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(convos));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }, [storageKey]);

  // Save current conversation ID to local storage
  const saveCurrentConversationId = useCallback((id: string | null): void => {
    try {
      if (id) {
        localStorage.setItem(currentConversationKey, id);
      } else {
        localStorage.removeItem(currentConversationKey);
      }
    } catch (error) {
      console.error('Error saving current conversation ID:', error);
    }
  }, [currentConversationKey]);

  // Create a new conversation
  const createNewConversation = useCallback((): Conversation => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [
        { role: 'system', content: defaultSystemPrompt }
      ],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    setConversations(prevConversations => {
      const updatedConversations = [newConversation, ...prevConversations];
      
      // Limit the number of stored conversations
      if (updatedConversations.length > maxConversations) {
        updatedConversations.pop();
      }
      
      saveConversationsToStorage(updatedConversations);
      return updatedConversations;
    });

    setCurrentConversationId(newConversation.id);
    saveCurrentConversationId(newConversation.id);
    setCurrentConversation(newConversation);
    
    return newConversation;
  }, [generateId, defaultSystemPrompt, maxConversations, saveConversationsToStorage, saveCurrentConversationId]);

  // Save or update a conversation
  const saveConversation = useCallback((conversation: Conversation): string => {
    const now = new Date().toISOString();
    const conversationToSave: Conversation = {
      ...conversation,
      lastUpdated: now
    };

    if (!conversationToSave.createdAt) {
      conversationToSave.createdAt = now;
    }

    if (!conversationToSave.id) {
      conversationToSave.id = generateId();
    }

    setConversations(prevConversations => {
      const index = prevConversations.findIndex(c => c.id === conversationToSave.id);
      let updatedConversations;

      if (index >= 0) {
        // Update existing conversation
        updatedConversations = [...prevConversations];
        updatedConversations[index] = conversationToSave;
      } else {
        // Add new conversation
        updatedConversations = [conversationToSave, ...prevConversations];
        
        // Limit the number of stored conversations
        if (updatedConversations.length > maxConversations) {
          updatedConversations.pop();
        }
      }

      saveConversationsToStorage(updatedConversations);
      return updatedConversations;
    });

    if (conversationToSave.id === currentConversationId) {
      setCurrentConversation(conversationToSave);
    }

    return conversationToSave.id;
  }, [generateId, currentConversationId, maxConversations, saveConversationsToStorage]);

  // Delete a conversation
  const deleteConversation = useCallback((id: string): boolean => {
    try {
      setConversations(prevConversations => {
        const updatedConversations = prevConversations.filter(c => c.id !== id);
        saveConversationsToStorage(updatedConversations);
        return updatedConversations;
      });

      // If we deleted the current conversation, clear that reference
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        saveCurrentConversationId(null);
        setCurrentConversation(null);
      }

      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }, [currentConversationId, saveConversationsToStorage, saveCurrentConversationId]);

  // Select a conversation
  const selectConversation = useCallback((id: string): Conversation | null => {
    const conversation = conversations.find(c => c.id === id) || null;
    
    if (conversation) {
      setCurrentConversationId(id);
      saveCurrentConversationId(id);
      setCurrentConversation(conversation);
    }
    
    return conversation;
  }, [conversations, saveCurrentConversationId]);

  // Update conversation title
  const updateTitle = useCallback((id: string, title: string): boolean => {
    const conversation = conversations.find(c => c.id === id);
    
    if (conversation) {
      const updated = {
        ...conversation,
        title,
        lastUpdated: new Date().toISOString()
      };
      
      saveConversation(updated);
      
      if (id === currentConversationId) {
        setCurrentConversation(updated);
      }
      
      return true;
    }
    
    return false;
  }, [conversations, currentConversationId, saveConversation]);

  // Update system prompt
  const updateSystemPrompt = useCallback((id: string, systemPrompt: string): boolean => {
    const conversation = conversations.find(c => c.id === id);
    
    if (conversation) {
      let updatedMessages = [...conversation.messages];
      const hasSystemMessage = updatedMessages.some(msg => msg.role === 'system');
      
      if (hasSystemMessage) {
        updatedMessages = updatedMessages.map(msg => 
          msg.role === 'system' ? { ...msg, content: systemPrompt } : msg
        );
      } else {
        updatedMessages.unshift({ role: 'system', content: systemPrompt });
      }
      
      const updated = {
        ...conversation,
        messages: updatedMessages,
        lastUpdated: new Date().toISOString()
      };
      
      saveConversation(updated);
      
      if (id === currentConversationId) {
        setCurrentConversation(updated);
      }
      
      return true;
    }
    
    return false;
  }, [conversations, currentConversationId, saveConversation]);

  // Add a message to the current conversation
  const addMessage = useCallback((message: Message): boolean => {
    if (!currentConversation) return false;
    
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, message],
      lastUpdated: new Date().toISOString()
    };
    
    saveConversation(updatedConversation);
    setCurrentConversation(updatedConversation);
    
    return true;
  }, [currentConversation, saveConversation]);

  // Load data on initial render
  useEffect(() => {
    const loadedConversations = loadConversations();
    setConversations(loadedConversations);
    
    const loadedId = loadCurrentConversationId();
    setCurrentConversationId(loadedId);
    
    if (loadedId) {
      const current = loadedConversations.find(c => c.id === loadedId) || null;
      setCurrentConversation(current);
    }
  }, [loadConversations, loadCurrentConversationId]);

  return {
    conversations,
    currentConversation,
    currentConversationId,
    createNewConversation,
    saveConversation,
    deleteConversation,
    selectConversation,
    updateTitle,
    updateSystemPrompt,
    addMessage
  };
};

export default useConversationManager;