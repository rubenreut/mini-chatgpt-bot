import React, { useEffect } from "react";
import "./App.css";
// Import Prism core first before any components
import Prism from "prismjs";
// Then import the theme
import "prismjs/themes/prism-tomorrow.css";
// Then import components
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-sql";

import MessageList from "./components/MessageList";
import ChatInput from "./components/chat/ChatInput";
import Header from "./components/Header";
import SystemPromptEditor from "./components/SystemPromptEditor";
import ConversationTitle from "./components/ConversationTitle";
import ConversationList from "./components/ConversationList";
import { useChatContext } from "./context/ChatContext";
import { useThemeContext } from "./context/ThemeContext";

const App: React.FC = () => {
  const {
    messages,
    loading,
    model,
    sendMessage,
    setModel,
    clearConversation,
    exportConversation,
    // Conversation management
    conversations,
    activeConversationId,
    showConversationList,
    setShowConversationList,
    loadConversation,
    createNewConversation,
    deleteConversation,
    conversationTitle,
    updateConversationTitle,
    // System prompt
    systemPrompt,
    showSystemPromptEditor,
    setShowSystemPromptEditor,
    updateSystemPrompt
  } = useChatContext();

  const { darkMode, toggleDarkMode } = useThemeContext();

  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  // Toggle conversation list sidebar
  const toggleConversationList = () => {
    setShowConversationList(!showConversationList);
  };

  return (
    <div className={`app-container ${showConversationList ? 'with-sidebar' : ''}`}>
      {showConversationList && (
        <aside className="conversation-sidebar">
          <div className="sidebar-header">
            <h2>Conversations</h2>
            <button 
              className="close-sidebar" 
              onClick={toggleConversationList}
              aria-label="Close conversation list"
            >
              ×
            </button>
          </div>
          <button 
            className="new-chat-button" 
            onClick={createNewConversation}
          >
            <span className="plus-icon">+</span> New Chat
          </button>
          <ConversationList 
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={(id: string) => {
              loadConversation(id);
              setShowConversationList(false);
            }}
            onDelete={deleteConversation}
          />
        </aside>
      )}
      
      <div className="chat-container">
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          selectedModel={model}
          onModelChange={setModel}
          onClearConversation={clearConversation}
          onExportConversation={exportConversation}
          onToggleConversations={toggleConversationList}
          showingConversations={showConversationList}
        />
        
        <ConversationTitle 
          title={conversationTitle}
          onTitleChange={updateConversationTitle}
          onNewConversation={createNewConversation}
        />
        
        <MessageList messages={messages} />
        
        <ChatInput 
          onSendMessage={sendMessage} 
          loading={loading} 
        />
        
        {showSystemPromptEditor && (
          <SystemPromptEditor 
            systemPrompt={systemPrompt}
            onSave={updateSystemPrompt}
            onCancel={() => setShowSystemPromptEditor(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;