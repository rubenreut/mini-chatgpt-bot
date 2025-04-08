import React from 'react';
import { useThemeContext } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  darkMode?: boolean;
  handleDarkModeToggle?: () => void;
}

const ThemeToggle = ({ 
  className = '', 
  darkMode: propDarkMode, 
  handleDarkModeToggle 
}: ThemeToggleProps): React.ReactNode => {
  const themeContext = useThemeContext();
  
  // Use props if provided, otherwise use context
  const isDarkMode = propDarkMode !== undefined ? propDarkMode : themeContext.darkMode;
  const toggleTheme = handleDarkModeToggle || themeContext.toggleDarkMode;
  
  return (
    <button 
      onClick={toggleTheme}
      className={`theme-toggle ${isDarkMode ? 'dark' : 'light'} ${className}`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default React.memo(ThemeToggle);