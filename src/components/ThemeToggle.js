import React from 'react';

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
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
