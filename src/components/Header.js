import React from 'react';
import ThemeToggle from './ThemeToggle';
import ModelSelector from './ModelSelector';
import ConversationControls from './ConversationControls';

const Header = ({ 
  darkMode, 
  toggleDarkMode, 
  selectedModel, 
  onModelChange, 
  onClearConversation,
  onExportConversation,
  onToggleConversations,
  showingConversations
}) => {
  return (
    <header className="chat-header">
      <div className="header-left">
        <button 
          className="conversations-toggle"
          onClick={onToggleConversations}
          title={showingConversations ? "Hide conversations" : "Show conversations"}
          aria-label={showingConversations ? "Hide conversations" : "Show conversations"}
          aria-expanded={showingConversations}
        >
          <span className="hamburger-icon">☰</span>
        </button>
        <h1 className="app-title">Mini ChatGPT Bot</h1>
      </div>
      
      <div className="header-controls">
        <div className="control-row">
          <ModelSelector selectedModel={selectedModel} onModelChange={onModelChange} />
          <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </div>
        <div className="control-row">
          <ConversationControls onClear={onClearConversation} onExport={onExportConversation} />
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);