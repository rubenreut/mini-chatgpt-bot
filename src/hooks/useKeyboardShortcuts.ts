import { useEffect } from 'react';
import shortcutManager from '../utils/keyboardShortcuts';

/**
 * Hook for registering keyboard shortcuts that integrates with the command palette
 */
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    // Register global question mark shortcut for keyboard shortcuts help
    shortcutManager.register(['?'], () => {
      // Find the keyboard shortcuts command in the command palette
      const helpButton = document.getElementById('command-help');
      if (helpButton) {
        helpButton.click();
      }
    }, 'help-shortcut');

    // Register Escape key to close modals
    shortcutManager.register(['Escape'], () => {
      // This is handled by individual components, but registered here
      // to prevent other shortcuts from conflicting
    }, 'escape-key');

    // Clean up on unmount
    return () => {
      shortcutManager.unregister('help-shortcut');
      shortcutManager.unregister('escape-key');
    };
  }, []);

  return shortcutManager;
};

export default useKeyboardShortcuts;