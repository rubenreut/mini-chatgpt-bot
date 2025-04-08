import React, { useEffect, lazy, Suspense } from "react";
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

// Import essential components immediately
import Header from "./features/core/components/Header";
import ErrorBoundary from "./utils/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import NetworkStatus from "./shared/components/NetworkStatus";

// Lazily load non-critical components
const MessageList = lazy(() => import("./features/chat/components/MessageList"));
const ChatInput = lazy(() => import("./features/chat/components/ChatInput"));
const SystemPromptEditor = lazy(() => import("./features/chat/components/SystemPromptEditor"));
const ConversationTitle = lazy(() => import("./features/conversation/components/ConversationTitle"));
const ConversationList = lazy(() => import("./features/conversation/components/ConversationList"));

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
      {/* Network Status Banner */}
      <NetworkStatus />
      
      {showConversationList && (
        <ErrorBoundary 
          fallback={
            <div className="error-sidebar">
              <h3>Unable to load conversations</h3>
              <button onClick={() => window.location.reload()}>
                Reload
              </button>
            </div>
          }
        >
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
            <Suspense fallback={<LoadingSpinner text="Loading conversations..." />}>
              <ConversationList 
                conversations={conversations}
                activeId={activeConversationId}
                handleSelect={handleConversationSelect}
                handleDelete={deleteConversation}
              />
            </Suspense>
          </aside>
        </ErrorBoundary>
      )}
      
      <div className="chat-container">
        <ErrorBoundary>
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
        </ErrorBoundary>
        
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner text="Loading conversation title..." />}>
            <ConversationTitle 
              title={conversationTitle}
              handleTitleChange={updateConversationTitle}
              handleNewConversation={createNewConversation}
            />
          </Suspense>
        </ErrorBoundary>
        
        <ErrorBoundary 
          fallback={(error, resetError) => (
            <div className="messages-error">
              <h3>Error displaying messages</h3>
              <p>There was a problem rendering the chat messages.</p>
              <button onClick={resetError}>Try Again</button>
            </div>
          )}
        >
          <Suspense fallback={<LoadingSpinner text="Loading messages..." />}>
            <MessageList messages={messages} />
          </Suspense>
        </ErrorBoundary>
        
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner text="Loading chat input..." />}>
            <ChatInput 
              handleSendMessage={sendMessage} 
              isLoading={loading} 
            />
          </Suspense>
        </ErrorBoundary>
        
        {showSystemPromptEditor && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner text="Loading system prompt editor..." />}>
              <SystemPromptEditor 
                systemPrompt={systemPrompt}
                handleSave={updateSystemPrompt}
                handleCancel={() => setShowSystemPromptEditor(false)}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default App;