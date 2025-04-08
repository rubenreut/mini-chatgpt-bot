import React from 'react';
import ThemeToggle from '../../theme/components/ThemeToggle';
import ModelSelector from '../../chat/components/ModelSelector';
import ConversationControls from '../../conversation/components/ConversationControls';
import styles from './Header.module.css';

interface HeaderProps {
  darkMode: boolean;
  handleDarkModeToggle: () => void;
  selectedModel: string;
  handleModelChange: (model: string) => void;
  handleClearConversation: () => void;
  handleExportConversation: () => void;
  handleToggleConversations: () => void;
  isShowingConversations: boolean;
}

const Header = ({
  darkMode,
  handleDarkModeToggle,
  selectedModel,
  handleModelChange,
  handleClearConversation,
  handleExportConversation,
  handleToggleConversations,
  isShowingConversations
}: HeaderProps): React.ReactNode => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={styles.conversationsToggle}
          onClick={handleToggleConversations}
          title={isShowingConversations ? "Hide conversations" : "Show conversations"}
          aria-label={isShowingConversations ? "Hide conversations" : "Show conversations"}
          aria-expanded={isShowingConversations}
        >
          <span className={styles.hamburgerIcon}>☰</span>
        </button>
        <h1 className={styles.appTitle}>Mini ChatGPT Bot</h1>
      </div>
      
      <div className={styles.headerControls}>
        <div className={styles.controlRow}>
          <ModelSelector selectedModel={selectedModel} handleModelChange={handleModelChange} />
          <ThemeToggle darkMode={darkMode} handleDarkModeToggle={handleDarkModeToggle} />
        </div>
        <div className={styles.controlRow}>
          <ConversationControls handleClear={handleClearConversation} handleExport={handleExportConversation} />
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);