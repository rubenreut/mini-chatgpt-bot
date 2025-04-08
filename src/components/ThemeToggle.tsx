import React from 'react';

interface ThemeToggleProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  darkMode, 
  toggleDarkMode 
}) => {
  return (
    <button 
      onClick={toggleDarkMode}
      className={`theme-toggle ${darkMode ? 'dark' : 'light'}`}
      title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default React.memo(ThemeToggle);