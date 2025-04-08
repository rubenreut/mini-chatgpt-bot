import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCommandPalette, Command } from './CommandPaletteContext';
import styles from './CommandPalette.module.css';

const CommandPalette: React.FC = () => {
  const { isOpen, closeCommandPalette, commands } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandListRef = useRef<HTMLDivElement>(null);

  // Reset selection and query when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands;

    return commands.filter((command) => {
      const searchQuery = query.toLowerCase();
      
      // Check title
      if (command.title.toLowerCase().includes(searchQuery)) {
        return true;
      }
      
      // Check section
      if (command.section?.toLowerCase().includes(searchQuery)) {
        return true;
      }
      
      // Check keywords
      if (command.keywords?.some(keyword => 
        keyword.toLowerCase().includes(searchQuery)
      )) {
        return true;
      }
      
      return false;
    });
  }, [commands, query]);

  // Group commands by section
  const commandsBySection = useMemo(() => {
    const sections: Record<string, Command[]> = {};
    
    filteredCommands.forEach(command => {
      const section = command.section || 'General';
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(command);
    });
    
    return sections;
  }, [filteredCommands]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prevIndex => 
          prevIndex < filteredCommands.length - 1 ? prevIndex + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prevIndex => 
          prevIndex > 0 ? prevIndex - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeCommandPalette();
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = document.getElementById(`command-${selectedIndex}`);
    if (selectedElement && commandListRef.current) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  // Execute command and close palette
  const executeCommand = (command: Command) => {
    closeCommandPalette();
    command.action();
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={closeCommandPalette}>
      <div 
        className={styles.container}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.25 12.5C10.1495 12.5 12.5 10.1495 12.5 7.25C12.5 4.35051 10.1495 2 7.25 2C4.35051 2 2 4.35051 2 7.25C2 10.1495 4.35051 12.5 7.25 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.9624 10.9625L13.9999 14.0001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={styles.searchInput}
            autoComplete="off"
            spellCheck="false"
          />
          <div className={styles.shortcut}>
            <span>ESC</span> to close
          </div>
        </div>
        
        <div className={styles.commandList} ref={commandListRef}>
          {Object.entries(commandsBySection).map(([section, sectionCommands]) => (
            <div key={section} className={styles.section}>
              <div className={styles.sectionTitle}>{section}</div>
              {sectionCommands.map((command, index) => {
                // Find the global index of this command in filteredCommands
                const globalIndex = filteredCommands.findIndex(cmd => cmd.id === command.id);
                const isSelected = globalIndex === selectedIndex;
                
                return (
                  <div
                    id={`command-${globalIndex}`}
                    key={command.id}
                    className={`${styles.command} ${isSelected ? styles.selected : ''}`}
                    onClick={() => executeCommand(command)}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                  >
                    <div className={styles.commandTitle}>{command.title}</div>
                    {command.shortcut && (
                      <div className={styles.shortcutKeys}>
                        {command.shortcut.map((key, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span>+</span>}
                            <span className={styles.shortcutKey}>{key}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className={styles.emptyState}>
              No commands found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;