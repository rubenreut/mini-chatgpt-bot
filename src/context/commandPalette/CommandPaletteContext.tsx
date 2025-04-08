import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

export interface Command {
  id: string;
  title: string;
  keywords?: string[];
  section?: string;
  shortcut?: string[];
  action: () => void;
}

interface CommandPaletteContextType {
  isOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  registerCommand: (command: Command) => void;
  unregisterCommand: (id: string) => void;
  commands: Command[];
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null);

interface CommandPaletteProviderProps {
  children: React.ReactNode;
}

export const CommandPaletteProvider: React.FC<CommandPaletteProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [commands, setCommands] = useState<Command[]>([]);

  const openCommandPalette = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsOpen(false);
  }, []);

  const registerCommand = useCallback((command: Command) => {
    setCommands(prevCommands => {
      // Check if command already exists
      const exists = prevCommands.some(cmd => cmd.id === command.id);
      if (exists) {
        // Replace existing command
        return prevCommands.map(cmd => cmd.id === command.id ? command : cmd);
      }
      // Add new command
      return [...prevCommands, command];
    });
  }, []);

  const unregisterCommand = useCallback((id: string) => {
    setCommands(prevCommands => prevCommands.filter(cmd => cmd.id !== id));
  }, []);

  // Handle keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(prevIsOpen => !prevIsOpen);
      } else if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <CommandPaletteContext.Provider
      value={{
        isOpen,
        openCommandPalette,
        closeCommandPalette,
        registerCommand,
        unregisterCommand,
        commands,
      }}
    >
      {children}
    </CommandPaletteContext.Provider>
  );
};

export const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within a CommandPaletteProvider');
  }
  return context;
};

export default CommandPaletteContext;