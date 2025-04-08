/**
 * Utility for registering global keyboard shortcuts
 */
type ShortcutHandler = (event: KeyboardEvent) => void;

interface RegisteredShortcut {
  keys: string[];
  handler: ShortcutHandler;
  id: string;
}

class KeyboardShortcutManager {
  private shortcuts: RegisteredShortcut[] = [];
  private enabled: boolean = true;

  constructor() {
    // Initialize event listener
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Register a new keyboard shortcut
   * @param keys Array of key identifiers (e.g. ['Alt', 'K'])
   * @param handler Function to run when shortcut is triggered
   * @param id Unique identifier for this shortcut
   */
  register(keys: string[], handler: ShortcutHandler, id: string): void {
    // Check if shortcut already exists
    const existingIndex = this.shortcuts.findIndex(s => s.id === id);
    
    if (existingIndex !== -1) {
      // Update existing shortcut
      this.shortcuts[existingIndex] = { keys, handler, id };
    } else {
      // Add new shortcut
      this.shortcuts.push({ keys, handler, id });
    }
  }

  /**
   * Unregister a keyboard shortcut by id
   * @param id The shortcut identifier to remove
   */
  unregister(id: string): void {
    this.shortcuts = this.shortcuts.filter(shortcut => shortcut.id !== id);
  }

  /**
   * Handle keydown events and trigger appropriate shortcuts
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.enabled) return;

    // Don't trigger shortcuts when typing in input, textarea, or contentEditable elements
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable ||
      // Don't process Alt+F4, Ctrl+F, etc. browser shortcuts
      (event.altKey && event.key === 'F4') ||
      (event.ctrlKey && (event.key === 'f' || event.key === 'p'))
    ) {
      return;
    }

    // Check each registered shortcut
    for (const shortcut of this.shortcuts) {
      const { keys, handler } = shortcut;
      
      // Match key combinations
      if (this.matchesShortcut(event, keys)) {
        event.preventDefault();
        handler(event);
        return;
      }
    }
  };

  /**
   * Check if a keyboard event matches a shortcut definition
   */
  private matchesShortcut(event: KeyboardEvent, keys: string[]): boolean {
    // Basic status of modifier keys
    const modifiers: Record<string, boolean> = {
      'Alt': event.altKey,
      'Ctrl': event.ctrlKey,
      'Control': event.ctrlKey,
      'Meta': event.metaKey,
      'Shift': event.shiftKey,
      '⌘': event.metaKey,
      '⌥': event.altKey,
      '⇧': event.shiftKey,
      '⌃': event.ctrlKey
    };

    // For single key shortcuts like '?'
    if (keys.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      return event.key === keys[0];
    }

    // For modifier+key combinations like Alt+N
    if (keys.length === 2) {
      const [modifier, key] = keys;
      return modifier in modifiers && modifiers[modifier] && event.key.toLowerCase() === key.toLowerCase();
    }

    // For other complex combinations
    let allModifiersMatch = true;
    let hasNonModifierKey = false;

    for (const key of keys) {
      if (key in modifiers) {
        // It's a modifier key
        if (!modifiers[key]) {
          allModifiersMatch = false;
          break;
        }
      } else {
        // It's a regular key
        hasNonModifierKey = true;
        if (event.key.toLowerCase() !== key.toLowerCase()) {
          return false;
        }
      }
    }

    return allModifiersMatch && hasNonModifierKey;
  }

  /**
   * Enable keyboard shortcuts
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable keyboard shortcuts
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.shortcuts = [];
  }
}

// Create a singleton instance
const shortcutManager = new KeyboardShortcutManager();

export default shortcutManager;