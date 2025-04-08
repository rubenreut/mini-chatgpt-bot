import React from 'react';
import ThemeToggle from '../../features/theme/components/ThemeToggle';
import ModelSelector from '../../features/chat/components/ModelSelector';
import ConversationControls from '../../features/conversation/components/ConversationControls';
import { useThemeContext } from '../../features/theme/context/ThemeContext';

interface HeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onClearConversation: () => void;
  onExportConversation: () => void;
  onToggleConversations: () => void;
  showingConversations: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  selectedModel, 
  onModelChange, 
  onClearConversation,
  onExportConversation,
  onToggleConversations,
  showingConversations
}) => {
  const { darkMode, toggleDarkMode } = useThemeContext();
  
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
          <ThemeToggle />
        </div>
        <div className="control-row">
          <ConversationControls onClear={onClearConversation} onExport={onExportConversation} />
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);