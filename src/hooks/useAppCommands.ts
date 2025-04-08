import { useEffect, useState } from 'react';
import { useCommandPalette, Command } from '../context/commandPalette';
import { useChatContext } from '../features/chat/context/ChatContext';
import { useThemeContext } from '../features/theme/context/ThemeContext';

/**
 * Hook to register application commands for the command palette
 */
export const useAppCommands = () => {
  const { registerCommand, unregisterCommand } = useCommandPalette();
  const { 
    clearConversation, 
    exportConversation, 
    createNewConversation,
    setShowConversationList,
    showConversationList,
    setShowSystemPromptEditor,
    showSystemPromptEditor
  } = useChatContext();
  const { darkMode, toggleDarkMode } = useThemeContext();
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  useEffect(() => {
    const commands: Command[] = [
      // Conversation commands
      {
        id: 'new-chat',
        title: 'New Chat',
        section: 'Conversation',
        keywords: ['create', 'new', 'chat', 'conversation', 'reset', 'start'],
        shortcut: ['Alt', 'N'],
        action: createNewConversation
      },
      {
        id: 'clear-chat',
        title: 'Clear Current Chat',
        section: 'Conversation',
        keywords: ['clear', 'delete', 'remove', 'reset', 'empty'],
        action: clearConversation
      },
      {
        id: 'export-chat',
        title: 'Export Current Conversation',
        section: 'Conversation',
        keywords: ['export', 'save', 'download', 'json', 'backup'],
        shortcut: ['Alt', 'E'],
        action: exportConversation
      },
      
      // UI commands
      {
        id: 'toggle-theme',
        title: `Switch to ${darkMode ? 'Light' : 'Dark'} Theme`,
        section: 'Interface',
        keywords: ['theme', 'dark', 'light', 'mode', 'toggle', 'switch', 'color'],
        shortcut: ['Alt', 'T'],
        action: toggleDarkMode
      },
      {
        id: 'toggle-conversations',
        title: `${showConversationList ? 'Hide' : 'Show'} Conversation List`,
        section: 'Interface',
        keywords: ['conversation', 'list', 'sidebar', 'history', 'hide', 'show'],
        shortcut: ['Alt', 'L'],
        action: () => setShowConversationList(!showConversationList)
      },
      {
        id: 'toggle-system-prompt',
        title: `${showSystemPromptEditor ? 'Hide' : 'Edit'} System Prompt`,
        section: 'Interface',
        keywords: ['system', 'prompt', 'edit', 'customize', 'instructions'],
        shortcut: ['Alt', 'P'],
        action: () => setShowSystemPromptEditor(!showSystemPromptEditor)
      },
      
      // Help commands
      {
        id: 'keyboard-shortcuts',
        title: 'Show Keyboard Shortcuts',
        section: 'Help',
        keywords: ['keyboard', 'shortcuts', 'keys', 'help', 'hotkeys'],
        shortcut: ['?'],
        action: () => setShowKeyboardShortcuts(true)
      }
    ];
    
    // Register all commands
    commands.forEach(command => registerCommand(command));
    
    // Cleanup function to unregister commands when component unmounts
    return () => {
      commands.forEach(command => unregisterCommand(command.id));
    };
  }, [
    registerCommand, 
    unregisterCommand, 
    clearConversation, 
    exportConversation, 
    createNewConversation,
    darkMode, 
    toggleDarkMode, 
    showConversationList,
    setShowConversationList,
    showSystemPromptEditor,
    setShowSystemPromptEditor
  ]);
  
  return { 
    showKeyboardShortcuts, 
    setShowKeyboardShortcuts 
  };
};

export default useAppCommands;