import React, { useEffect } from "react";
import "./App.css";

// Import Prism for code highlighting
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-sql";

// Import components from feature folders
import MessageList from "./features/chat/components/MessageList";
import ChatInput from "./features/chat/components/ChatInput";
import Header from "./features/core/components/Header";
import SystemPromptEditor from "./features/chat/components/SystemPromptEditor";
import ConversationTitle from "./features/conversation/components/ConversationTitle";
import ConversationList from "./features/conversation/components/ConversationList";

// Import context hooks
import { useChatContext } from "./features/chat/context/ChatContext";
import { useThemeContext } from "./features/theme/context/ThemeContext";

const App = (): React.ReactNode => {
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

  // Highlight code blocks when messages change
  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  // Toggle conversation list sidebar
  const handleToggleConversationList = (): void => {
    setShowConversationList(!showConversationList);
  };

  // Handle conversation selection
  const handleConversationSelect = (id: string): void => {
    loadConversation(id);
    setShowConversationList(false);
  };

  return (
    <div className={`app-container ${showConversationList ? 'with-sidebar' : ''}`}>
      {showConversationList && (
        <aside className="conversation-sidebar">
          <div className="sidebar-header">
            <h2>Conversations</h2>
            <button 
              className="close-sidebar" 
              onClick={handleToggleConversationList}
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
            handleSelect={handleConversationSelect}
            handleDelete={deleteConversation}
          />
        </aside>
      )}
      
      <div className="chat-container">
        <Header
          darkMode={darkMode}
          handleDarkModeToggle={toggleDarkMode}
          selectedModel={model}
          handleModelChange={setModel}
          handleClearConversation={clearConversation}
          handleExportConversation={exportConversation}
          handleToggleConversations={handleToggleConversationList}
          isShowingConversations={showConversationList}
        />
        
        <ConversationTitle 
          title={conversationTitle}
          handleTitleChange={updateConversationTitle}
          handleNewConversation={createNewConversation}
        />
        
        <MessageList messages={messages} />
        
        <ChatInput 
          handleSendMessage={sendMessage} 
          isLoading={loading} 
        />
        
        {showSystemPromptEditor && (
          <SystemPromptEditor 
            systemPrompt={systemPrompt}
            handleSave={updateSystemPrompt}
            handleCancel={() => setShowSystemPromptEditor(false)}
          />
        )}
      </div>
    </div>
  );
};

export default App;