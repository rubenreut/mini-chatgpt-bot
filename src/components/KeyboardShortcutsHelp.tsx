import React from 'react';
import styles from './KeyboardShortcutsHelp.module.css';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutSection {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutSections: ShortcutSection[] = [
    {
      title: 'General',
      shortcuts: [
        { keys: ['⌘', 'K'], description: 'Open command palette' },
        { keys: ['Esc'], description: 'Close dialogs' },
      ]
    },
    {
      title: 'Conversation',
      shortcuts: [
        { keys: ['Alt', 'N'], description: 'New chat' },
        { keys: ['Alt', 'E'], description: 'Export conversation' },
      ]
    },
    {
      title: 'Interface',
      shortcuts: [
        { keys: ['Alt', 'T'], description: 'Toggle dark/light theme' },
        { keys: ['Alt', 'L'], description: 'Toggle conversation list' },
        { keys: ['Alt', 'P'], description: 'Edit system prompt' },
      ]
    }
  ];

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Keyboard Shortcuts</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.content}>
          {shortcutSections.map((section, index) => (
            <div key={index} className={styles.section}>
              <h3>{section.title}</h3>
              <div className={styles.shortcutList}>
                {section.shortcuts.map((shortcut, i) => (
                  <div key={i} className={styles.shortcutItem}>
                    <div className={styles.keys}>
                      {shortcut.keys.map((key, j) => (
                        <React.Fragment key={j}>
                          {j > 0 && <span className={styles.keySeparator}>+</span>}
                          <kbd>{key}</kbd>
                        </React.Fragment>
                      ))}
                    </div>
                    <div className={styles.description}>{shortcut.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;