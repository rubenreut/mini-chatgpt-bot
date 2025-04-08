import React from 'react';
import { useThemeContext } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { darkMode, toggleDarkMode } = useThemeContext();
  
  return (
    <button 
      onClick={toggleDarkMode}
      className={`theme-toggle ${darkMode ? 'dark' : 'light'} ${className}`}
      title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default React.memo(ThemeToggle);