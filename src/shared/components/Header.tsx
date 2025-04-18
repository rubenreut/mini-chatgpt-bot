import React from 'react';
import ThemeToggle from '../../features/theme/components/ThemeToggle';
import ModelSelector from '../../features/chat/components/ModelSelector';
import ConversationControls from '../../features/conversation/components/ConversationControls';
import { useThemeContext } from '../../features/theme/context/ThemeContext';

interface HeaderProps {
  selectedModel: string;
  handleModelChange: (model: string) => void;
  handleClearConversation: () => void;
  handleExportConversation: () => void;
  handleToggleConversations: () => void;
  isShowingConversations: boolean;
}

const Header = ({ 
  selectedModel, 
  handleModelChange, 
  handleClearConversation,
  handleExportConversation,
  handleToggleConversations,
  isShowingConversations
}: HeaderProps): React.ReactNode => {
  const { darkMode, toggleDarkMode } = useThemeContext();
  
  return (
    <header className="chat-header">
      <div className="header-left">
        <button 
          className="conversations-toggle"
          onClick={handleToggleConversations}
          title={isShowingConversations ? "Hide conversations" : "Show conversations"}
          aria-label={isShowingConversations ? "Hide conversations" : "Show conversations"}
          aria-expanded={isShowingConversations}
        >
          <span className="hamburger-icon">☰</span>
        </button>
        <h1 className="app-title">Mini ChatGPT Bot</h1>
      </div>
      
      <div className="header-controls">
        <div className="control-row">
          <ModelSelector selectedModel={selectedModel} handleModelChange={handleModelChange} />
          <ThemeToggle darkMode={darkMode} handleDarkModeToggle={toggleDarkMode} />
        </div>
        <div className="control-row">
          <ConversationControls handleClear={handleClearConversation} handleExport={handleExportConversation} />
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);