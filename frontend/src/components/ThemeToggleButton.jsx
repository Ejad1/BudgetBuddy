import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  // Simple button style, customize as needed in styles.css
  const buttonStyle = {
    background: 'none',
    border: '1px solid var(--border-input)',
    color: 'var(--text-secondary)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9em'
  };

  return (
    <button onClick={toggleTheme} style={buttonStyle} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'} 
    </button>
  );
};

export default ThemeToggleButton; 