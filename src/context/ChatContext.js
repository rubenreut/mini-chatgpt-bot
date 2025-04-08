import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import conversationManager from '../utils/conversationManager';
import speechSynthesis from '../utils/speechSynthesis';

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  // Core state
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(process.env.REACT_APP_OPENAI_API_KEY || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [model, setModel] = useState('gpt-4');
  
  // Conversation management
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [showConversationList, setShowConversationList] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('New Conversation');
  
  // UI State
  const [showSystemPromptEditor, setShowSystemPromptEditor] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  
  // Voice features
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
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
      setModel(savedModel);
    }
    
    const voiceEnabledSetting = localStorage.getItem('voice_enabled');
    if (voiceEnabledSetting !== null) {
      setVoiceEnabled(voiceEnabledSetting === 'true');
    }
  }, []);
  
  // Load conversations and set active conversation
  useEffect(() => {
    const allConversations = conversationManager.getAllConversations();
    setConversations(allConversations);
    
    const currentId = conversationManager.getCurrentConversationId();
    if (currentId && allConversations.some(c => c.id === currentId)) {
      setActiveConversationId(currentId);
      loadConversation(currentId);
    } else if (allConversations.length > 0) {
      // If no current ID or it's invalid, use the most recent conversation
      setActiveConversationId(allConversations[0].id);
      loadConversation(allConversations[0].id);
    } else {
      // If no conversations exist, create a new one
      createNewConversation();
    }
  }, []);
  
  // Save model preference to localStorage
  useEffect(() => {
    localStorage.setItem('selected_model', model);
  }, [model]);
  
  // Save voice preference to localStorage
  useEffect(() => {
    localStorage.setItem('voice_enabled', voiceEnabled.toString());
  }, [voiceEnabled]);
  
  // Load a specific conversation
  const loadConversation = useCallback((id) => {
    const conversation = conversationManager.getConversation(id);
    if (conversation) {
      setMessages(conversation.messages);
      setConversationTitle(conversation.title);
      
      // Get system prompt
      const systemMsg = conversation.messages.find(msg => msg.role === 'system');
      if (systemMsg) {
        setSystemPrompt(systemMsg.content);
      }
      
      setActiveConversationId(id);
      conversationManager.setCurrentConversationId(id);
    }
  }, []);
  
  // Create a new conversation
  const createNewConversation = useCallback(() => {
    const newConvo = conversationManager.createNewConversation(systemPrompt);
    setMessages(newConvo.messages);
    setConversationTitle(newConvo.title);
    setActiveConversationId(newConvo.id);
    
    // Refresh conversation list
    setConversations(conversationManager.getAllConversations());
    return newConvo.id;
  }, [systemPrompt]);
  
  // Delete a conversation
  const deleteConversation = useCallback((id) => {
    conversationManager.deleteConversation(id);
    setConversations(conversationManager.getAllConversations());
    
    if (id === activeConversationId) {
      const remainingConversations = conversationManager.getAllConversations();
      if (remainingConversations.length > 0) {
        loadConversation(remainingConversations[0].id);
      } else {
        createNewConversation();
      }
    }
  }, [activeConversationId, loadConversation, createNewConversation]);
  
  // Update conversation title
  const updateConversationTitle = useCallback((title) => {
    if (activeConversationId) {
      conversationManager.updateTitle(activeConversationId, title);
      setConversationTitle(title);
      setConversations(conversationManager.getAllConversations());
    }
  }, [activeConversationId]);
  
  // Update system prompt
  const updateSystemPrompt = useCallback((prompt) => {
    setSystemPrompt(prompt);
    
    // Update messages state
    setMessages(prevMessages => {
      const hasSystem = prevMessages.some(msg => msg.role === 'system');
      if (hasSystem) {
        return prevMessages.map(msg => 
          msg.role === 'system' ? { ...msg, content: prompt } : msg
        );
      } else {
        return [{ role: 'system', content: prompt }, ...prevMessages];
      }
    });
    
    // Update in storage if we have an active conversation
    if (activeConversationId) {
      conversationManager.updateSystemPrompt(activeConversationId, prompt);
    }
    
    setShowSystemPromptEditor(false);
  }, [activeConversationId]);
  
  // Save current messages to active conversation
  const saveCurrentConversation = useCallback(() => {
    if (!activeConversationId || messages.length <= 1) return;
    
    const conversation = {
      id: activeConversationId,
      title: conversationTitle,
      messages
    };
    
    conversationManager.saveConversation(conversation);
    setConversations(conversationManager.getAllConversations());
  }, [activeConversationId, conversationTitle, messages]);
  
  // Auto-save on messages change
  useEffect(() => {
    if (messages.length > 1 && activeConversationId) {
      saveCurrentConversation();
    }
  }, [messages, saveCurrentConversation, activeConversationId]);
  
  // Voice input handler
  const handleVoiceInput = useCallback((transcript) => {
    if (transcript) {
      sendMessage(transcript);
      setIsListening(false);
    }
  }, []);
  
  // Text-to-speech for assistant responses
  useEffect(() => {
    if (!voiceEnabled || !speechSynthesis.isSupported()) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !loading) {
      setIsSpeaking(true);
      
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
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    }
    
    return () => {
      if (isSpeaking) {
        speechSynthesis.stop();
        setIsSpeaking(false);
      }
    };
  }, [messages, loading, voiceEnabled]);
  
  // Send message to API
  const sendMessage = useCallback(async (messageData) => {
    const userText = messageData.text || '';
    const files = messageData.files || [];
    
    if (!userText.trim() && files.length === 0) return;
    
    // Stop any ongoing speech
    if (isSpeaking) {
      speechSynthesis.stop();
      setIsSpeaking(false);
    }

    // Create message content with file info if needed
    let userContent = userText;
    
    // If there are files, add file information to the message
    if (files.length > 0) {
      const fileList = files.map(file => `- ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)`).join('\n');
      
      // Add file info to user message
      userContent += userContent ? '\n\n' : '';
      userContent += `Attached files:\n${fileList}`;
      
      // Process files to extract content for the LLM
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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
                reader.readAsText(file);
              } else if (file.type.startsWith('image/')) {
                // For images we could use readAsDataURL, but for simplicity
                // just mention we can't process the image directly
                resolve(`[This is an image file. In a production environment, we would process this using image analysis capabilities.]`);
              } else {
                resolve(`[File content not directly accessible. This file type (${file.type}) requires specialized processing.]`);
              }
            });
          };
          
          // Read the file and add its content to the message
          const content = await readFileAsText(file);
          userContent += `\n\n--------- CONTENT OF FILE: ${file.name} ---------\n${content}\n----------- END OF FILE CONTENT -----------`;
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error);
          userContent += `\n\nError reading file ${file.name}: ${error.message}`;
        }
      }
    }

    const newMessages = [...messages, { role: 'user', content: userContent }];
    setMessages(newMessages);
    setLoading(true);

    // If first message in the conversation, update title automatically
    if (messages.filter(msg => msg.role === 'user').length === 0) {
      const title = userText.length > 30 
        ? userText.substring(0, 27) + '...' 
        : userText || 'File upload';
      setConversationTitle(title);
      
      if (activeConversationId) {
        conversationManager.updateTitle(activeConversationId, title);
      }
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: model,
          messages: newMessages,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const reply = response.data.choices[0].message;
      setMessages([...newMessages, reply]);
    } catch (error) {
      console.error('Error calling ChatGPT:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          'Sorry, there was an error processing your request. Please try again later.';
      
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `⚠️ Error: ${errorMessage}`
        }
      ]);
    }

    setLoading(false);
  }, [messages, model, activeConversationId, isSpeaking]);
  
  // Handle API key submission
  const handleApiKeySubmit = useCallback((e) => {
    e.preventDefault();
    if (apiKey.trim() && apiKey.startsWith('sk-')) {
      localStorage.setItem('openai_api_key', apiKey);
      setShowApiKeyModal(false);
    }
  }, [apiKey]);
  
  // Clear current conversation
  const clearConversation = useCallback(() => {
    // Keep the system message, clear everything else
    const systemMsg = messages.find(msg => msg.role === 'system') || 
                     { role: 'system', content: systemPrompt };
    
    setMessages([systemMsg]);
    createNewConversation();
  }, [messages, systemPrompt, createNewConversation]);
  
  // Export current conversation
  const exportConversation = useCallback(() => {
    const conversationText = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
    
    const fileName = conversationTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages, conversationTitle]);
  
  // Toggle voice features
  const toggleVoiceFeatures = useCallback(() => {
    if (!voiceEnabled && !speechSynthesis.isSupported()) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }
    
    setVoiceEnabled(!voiceEnabled);
  }, [voiceEnabled]);

  return (
    <ChatContext.Provider
      value={{
        // Core state
        messages,
        loading,
        apiKey,
        showApiKeyModal,
        model,
        setApiKey,
        setShowApiKeyModal,
        sendMessage,
        handleApiKeySubmit,
        setModel,
        
        // Conversation management
        conversations,
        activeConversationId,
        showConversationList,
        setShowConversationList,
        loadConversation,
        createNewConversation,
        deleteConversation,
        
        // Conversation details
        conversationTitle,
        updateConversationTitle,
        clearConversation,
        exportConversation,
        
        // System prompt
        systemPrompt,
        showSystemPromptEditor, 
        setShowSystemPromptEditor,
        updateSystemPrompt,
        
        // Voice features
        isListening,
        setIsListening,
        handleVoiceInput,
        isSpeaking,
        voiceEnabled,
        toggleVoiceFeatures
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};