import React, { createContext, useContext, useEffect, useCallback, useReducer } from 'react';
import axios from 'axios';
import conversationManager from '../utils/conversationManager';
import speechSynthesis from '../utils/speechSynthesis';

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

// Action types for reducer
const ACTIONS = {
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_MODEL: 'SET_MODEL',
  TOGGLE_API_KEY_MODAL: 'TOGGLE_API_KEY_MODAL',
  SET_API_KEY: 'SET_API_KEY',
  SET_CONVERSATION_LIST_VISIBILITY: 'SET_CONVERSATION_LIST_VISIBILITY',
  SET_ACTIVE_CONVERSATION: 'SET_ACTIVE_CONVERSATION',
  UPDATE_CONVERSATIONS: 'UPDATE_CONVERSATIONS',
  SET_CONVERSATION_TITLE: 'SET_CONVERSATION_TITLE',
  TOGGLE_SYSTEM_PROMPT_EDITOR: 'TOGGLE_SYSTEM_PROMPT_EDITOR',
  SET_SYSTEM_PROMPT: 'SET_SYSTEM_PROMPT',
  TOGGLE_VOICE_ENABLED: 'TOGGLE_VOICE_ENABLED',
  SET_LISTENING: 'SET_LISTENING',
  SET_SPEAKING: 'SET_SPEAKING'
};

// Initial state
const initialState = {
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

// Reducer function
function chatReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload };
    
    case ACTIONS.ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] };
    
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_MODEL:
      return { ...state, model: action.payload };
    
    case ACTIONS.TOGGLE_API_KEY_MODAL:
      return { ...state, showApiKeyModal: action.payload };
    
    case ACTIONS.SET_API_KEY:
      return { ...state, apiKey: action.payload };
    
    case ACTIONS.SET_CONVERSATION_LIST_VISIBILITY:
      return { ...state, showConversationList: action.payload };
    
    case ACTIONS.SET_ACTIVE_CONVERSATION:
      return { 
        ...state, 
        activeConversationId: action.payload.id, 
        messages: action.payload.messages,
        conversationTitle: action.payload.title,
        systemPrompt: action.payload.systemPrompt
      };
    
    case ACTIONS.UPDATE_CONVERSATIONS:
      return { ...state, conversations: action.payload };
    
    case ACTIONS.SET_CONVERSATION_TITLE:
      return { ...state, conversationTitle: action.payload };
    
    case ACTIONS.TOGGLE_SYSTEM_PROMPT_EDITOR:
      return { ...state, showSystemPromptEditor: action.payload };
    
    case ACTIONS.SET_SYSTEM_PROMPT:
      // Update system prompt and messages
      const hasSystem = state.messages.some(msg => msg.role === 'system');
      let updatedMessages;
      
      if (hasSystem) {
        updatedMessages = state.messages.map(msg => 
          msg.role === 'system' ? { ...msg, content: action.payload } : msg
        );
      } else {
        updatedMessages = [{ role: 'system', content: action.payload }, ...state.messages];
      }
      
      return { 
        ...state, 
        systemPrompt: action.payload,
        messages: updatedMessages
      };
    
    case ACTIONS.TOGGLE_VOICE_ENABLED:
      return { ...state, voiceEnabled: action.payload };
    
    case ACTIONS.SET_LISTENING:
      return { ...state, isListening: action.payload };
    
    case ACTIONS.SET_SPEAKING:
      return { ...state, isSpeaking: action.payload };
    
    default:
      return state;
  }
}

export const ChatProvider = ({ children }) => {
  // Use reducer for state management
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    showApiKeyModal: !localStorage.getItem('openai_api_key')
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
      dispatch({ type: ACTIONS.SET_MODEL, payload: savedModel });
    }
    
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      dispatch({ type: ACTIONS.SET_API_KEY, payload: savedApiKey });
    }
    
    const voiceEnabledSetting = localStorage.getItem('voice_enabled');
    if (voiceEnabledSetting !== null) {
      dispatch({ type: ACTIONS.TOGGLE_VOICE_ENABLED, payload: voiceEnabledSetting === 'true' });
    }
  }, []);
  
  // Load conversations and set active conversation
  useEffect(() => {
    const allConversations = conversationManager.getAllConversations();
    dispatch({ type: ACTIONS.UPDATE_CONVERSATIONS, payload: allConversations });
    
    const currentId = conversationManager.getCurrentConversationId();
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
  const loadConversation = useCallback((id) => {
    const conversation = conversationManager.getConversation(id);
    if (conversation) {
      // Get system prompt
      const systemMsg = conversation.messages.find(msg => msg.role === 'system');
      const systemPromptContent = systemMsg ? systemMsg.content : state.systemPrompt;
      
      dispatch({ 
        type: ACTIONS.SET_ACTIVE_CONVERSATION,
        payload: {
          id,
          messages: conversation.messages,
          title: conversation.title,
          systemPrompt: systemPromptContent
        }
      });
      
      conversationManager.setCurrentConversationId(id);
    }
  }, [state.systemPrompt]);
  
  // Create a new conversation
  const createNewConversation = useCallback(() => {
    const newConvo = conversationManager.createNewConversation(state.systemPrompt);
    
    dispatch({ 
      type: ACTIONS.SET_ACTIVE_CONVERSATION,
      payload: {
        id: newConvo.id,
        messages: newConvo.messages,
        title: newConvo.title,
        systemPrompt: state.systemPrompt
      }
    });
    
    // Refresh conversation list
    dispatch({ 
      type: ACTIONS.UPDATE_CONVERSATIONS, 
      payload: conversationManager.getAllConversations() 
    });
    
    return newConvo.id;
  }, [state.systemPrompt]);
  
  // Delete a conversation
  const deleteConversation = useCallback((id) => {
    conversationManager.deleteConversation(id);
    const allConversations = conversationManager.getAllConversations();
    dispatch({ type: ACTIONS.UPDATE_CONVERSATIONS, payload: allConversations });
    
    if (id === state.activeConversationId) {
      if (allConversations.length > 0) {
        loadConversation(allConversations[0].id);
      } else {
        createNewConversation();
      }
    }
  }, [state.activeConversationId, loadConversation, createNewConversation]);
  
  // Update conversation title
  const updateConversationTitle = useCallback((title) => {
    if (state.activeConversationId) {
      conversationManager.updateTitle(state.activeConversationId, title);
      dispatch({ type: ACTIONS.SET_CONVERSATION_TITLE, payload: title });
      dispatch({ 
        type: ACTIONS.UPDATE_CONVERSATIONS, 
        payload: conversationManager.getAllConversations() 
      });
    }
  }, [state.activeConversationId]);
  
  // Update system prompt
  const updateSystemPrompt = useCallback((prompt) => {
    dispatch({ type: ACTIONS.SET_SYSTEM_PROMPT, payload: prompt });
    
    // Update in storage if we have an active conversation
    if (state.activeConversationId) {
      conversationManager.updateSystemPrompt(state.activeConversationId, prompt);
    }
    
    dispatch({ type: ACTIONS.TOGGLE_SYSTEM_PROMPT_EDITOR, payload: false });
  }, [state.activeConversationId]);
  
  // Save current messages to active conversation
  const saveCurrentConversation = useCallback(() => {
    if (!state.activeConversationId || state.messages.length <= 1) return;
    
    const conversation = {
      id: state.activeConversationId,
      title: state.conversationTitle,
      messages: state.messages
    };
    
    conversationManager.saveConversation(conversation);
    dispatch({ 
      type: ACTIONS.UPDATE_CONVERSATIONS, 
      payload: conversationManager.getAllConversations() 
    });
  }, [state.activeConversationId, state.conversationTitle, state.messages]);
  
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
      dispatch({ type: ACTIONS.SET_SPEAKING, payload: true });
      
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
        onEnd: () => dispatch({ type: ACTIONS.SET_SPEAKING, payload: false }),
        onError: () => dispatch({ type: ACTIONS.SET_SPEAKING, payload: false })
      });
    }
    
    return () => {
      if (state.isSpeaking) {
        speechSynthesis.stop();
        dispatch({ type: ACTIONS.SET_SPEAKING, payload: false });
      }
    };
  }, [state.messages, state.loading, state.voiceEnabled, state.isSpeaking]);
  
  // Send message to API
  const sendMessage = useCallback(async (messageData) => {
    const userText = messageData.text || '';
    const files = messageData.files || [];
    
    if (!userText.trim() && files.length === 0) return;
    
    // Check if API key is available
    if (!state.apiKey.trim()) {
      dispatch({ type: ACTIONS.TOGGLE_API_KEY_MODAL, payload: true });
      return;
    }
    
    // Stop any ongoing speech
    if (state.isSpeaking) {
      speechSynthesis.stop();
      dispatch({ type: ACTIONS.SET_SPEAKING, payload: false });
    }

    // Create message content with file info if needed
    let userContent = userText;
    
    // If there are files, add file information to the message
    if (files.length > 0) {
      const fileList = files.map(file => `- ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)`).join('\n');
      
      // Add file info to user message
      userContent += userContent ? '\n\n' : '';
      userContent += `Attached files:\n${fileList}`;
      
      // Process files to extract content for the LLM - batching requests for better performance
      const batchSize = 3; // Process 3 files at a time
      const batches = [];
      
      // Create batches of files
      for (let i = 0; i < files.length; i += batchSize) {
        batches.push(files.slice(i, i + batchSize));
      }
      
      // Process each batch sequentially
      for (const batch of batches) {
        const fileContents = await Promise.all(batch.map(async (file) => {
          try {
            // Create a Promise wrapper around FileReader
            const readFileAsText = (file) => {
              return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
                
                // Read file based on type
                if (file.type.startsWith('text/') || 
                    file.type === 'application/json' || 
                    file.name.endsWith('.md') || 
                    file.name.endsWith('.txt') ||
                    file.name.endsWith('.csv')) {
                  // For large files, limit reading to first megabyte
                  if (file.size > 1024 * 1024) {
                    reader.readAsText(file.slice(0, 1024 * 1024));
                  } else {
                    reader.readAsText(file);
                  }
                } else if (file.type.startsWith('image/')) {
                  resolve(`[This is an image file. In a production environment, we would process this using image analysis capabilities.]`);
                } else {
                  resolve(`[File content not directly accessible. This file type (${file.type}) requires specialized processing.]`);
                }
              });
            };
            
            // Read the file and return formatted content
            const content = await readFileAsText(file);
            return {
              name: file.name,
              content
            };
          } catch (error) {
            console.error(`Error reading file ${file.name}:`, error);
            return {
              name: file.name,
              content: `Error reading file: ${error.message}`
            };
          }
        }));
        
        // Add all file contents to the message
        for (const fileContent of fileContents) {
          userContent += `\n\n--------- CONTENT OF FILE: ${fileContent.name} ---------\n${fileContent.content}\n----------- END OF FILE CONTENT -----------`;
        }
      }
    }

    // Add the user message to state
    const userMessage = { role: 'user', content: userContent };
    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: userMessage });
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    // Create a new array with all messages including the new user message
    const newMessages = [...state.messages, userMessage];

    // If first message in the conversation, update title automatically
    if (state.messages.filter(msg => msg.role === 'user').length === 0) {
      const title = userText.length > 30 
        ? userText.substring(0, 27) + '...' 
        : userText || 'File upload';
      
      dispatch({ type: ACTIONS.SET_CONVERSATION_TITLE, payload: title });
      
      if (state.activeConversationId) {
        conversationManager.updateTitle(state.activeConversationId, title);
      }
    }

    try {
      if (!state.apiKey) {
        throw new Error('No API key provided. Please enter your OpenAI API key.');
      }
      
      // Define maximum retry attempts for network issues
      const maxRetries = 2;
      let retries = 0;
      let response;
      
      while (retries <= maxRetries) {
        try {
          response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: state.model,
              messages: newMessages,
            },
            {
              headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 30000, // 30 second timeout
            }
          );
          break; // Success, exit retry loop
        } catch (retryError) {
          // Only retry on network errors or 429 (rate limit) or 5xx errors
          if (
            !retryError.response || 
            retryError.code === 'ECONNABORTED' ||
            retryError.response.status === 429 ||
            retryError.response.status >= 500
          ) {
            retries++;
            if (retries > maxRetries) throw retryError; // Re-throw if max retries reached
            
            // Exponential backoff with jitter
            const delay = Math.min(1000 * (2 ** retries) + Math.random() * 1000, 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw retryError; // Non-retriable error, re-throw immediately
          }
        }
      }

      const reply = response.data.choices[0].message;
      dispatch({ type: ACTIONS.ADD_MESSAGE, payload: reply });
    } catch (error) {
      console.error('Error calling ChatGPT:', error);
      
      let errorMessage;
      let errorType = 'UNKNOWN';
      
      // Handle different error types
      if (!error.response) {
        // Network error
        errorType = 'NETWORK';
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.response.status === 401) {
        // Authentication error - Invalid API key
        errorType = 'AUTH';
        errorMessage = 'Invalid API key. Please check your API key and try again.';
        // Show API key modal on next render
        setTimeout(() => dispatch({ type: ACTIONS.TOGGLE_API_KEY_MODAL, payload: true }), 0);
      } else if (error.response.status === 429) {
        // Rate limit error
        errorType = 'RATE_LIMIT';
        errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
      } else if (error.response.status >= 500) {
        // Server error
        errorType = 'SERVER';
        errorMessage = 'OpenAI server error. Please try again later.';
      } else if (error.message === 'No API key provided. Please enter your OpenAI API key.') {
        // Missing API key
        errorType = 'NO_API_KEY';
        errorMessage = error.message;
      } else {
        // Other errors (parse the error message from OpenAI if available)
        errorType = 'API';
        errorMessage = error.response?.data?.error?.message || 
                       'Sorry, there was an error processing your request. Please try again later.';
      }
      
      dispatch({ 
        type: ACTIONS.ADD_MESSAGE, 
        payload: {
          role: 'assistant',
          content: `⚠️ Error: ${errorMessage}`,
          error: true,
          errorType
        }
      });
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: false });
  }, [state.messages, state.model, state.activeConversationId, state.isSpeaking, state.apiKey]);
  
  // Handle API key submission
  const handleApiKeySubmit = useCallback((e) => {
    e.preventDefault();
    if (state.apiKey.trim() && state.apiKey.startsWith('sk-')) {
      // Store API key in localStorage (client-side only)
      // Note: In production, consider a more secure approach using a backend
      localStorage.setItem('openai_api_key', state.apiKey);
      dispatch({ type: ACTIONS.TOGGLE_API_KEY_MODAL, payload: false });
    }
  }, [state.apiKey]);
  
  // Voice input handler - defined after sendMessage to avoid 'used before defined' warning
  const handleVoiceInput = useCallback((transcript) => {
    if (transcript) {
      if (typeof transcript === 'string') {
        sendMessage({ text: transcript, files: [] });
      }
      dispatch({ type: ACTIONS.SET_LISTENING, payload: false });
    }
  }, [sendMessage]);
  
  // Clear current conversation
  const clearConversation = useCallback(() => {
    // Keep the system message, clear everything else
    const systemMsg = state.messages.find(msg => msg.role === 'system') || 
                      { role: 'system', content: state.systemPrompt };
    
    dispatch({ type: ACTIONS.SET_MESSAGES, payload: [systemMsg] });
    createNewConversation();
  }, [state.messages, state.systemPrompt, createNewConversation]);
  
  // Export current conversation
  const exportConversation = useCallback(() => {
    const conversationText = state.messages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
    
    const fileName = state.conversationTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase();
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
    
    dispatch({ type: ACTIONS.TOGGLE_VOICE_ENABLED, payload: !state.voiceEnabled });
  }, [state.voiceEnabled]);

  // Action dispatchers for components
  const setApiKey = useCallback((value) => {
    dispatch({ type: ACTIONS.SET_API_KEY, payload: value });
  }, []);

  const setShowApiKeyModal = useCallback((value) => {
    dispatch({ type: ACTIONS.TOGGLE_API_KEY_MODAL, payload: value });
  }, []);

  const setModel = useCallback((value) => {
    dispatch({ type: ACTIONS.SET_MODEL, payload: value });
  }, []);

  const setShowConversationList = useCallback((value) => {
    dispatch({ type: ACTIONS.SET_CONVERSATION_LIST_VISIBILITY, payload: value });
  }, []);

  const setShowSystemPromptEditor = useCallback((value) => {
    dispatch({ type: ACTIONS.TOGGLE_SYSTEM_PROMPT_EDITOR, payload: value });
  }, []);

  const setIsListening = useCallback((value) => {
    dispatch({ type: ACTIONS.SET_LISTENING, payload: value });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        // Core state
        messages: state.messages,
        loading: state.loading,
        apiKey: state.apiKey,
        showApiKeyModal: state.showApiKeyModal,
        model: state.model,
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};