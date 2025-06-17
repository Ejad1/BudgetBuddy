import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext'; // Import useLanguage
import '../styles.css';
import ThemeToggleButton from '../components/ThemeToggleButton'; // Reuse the toggle button

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage(); // Get language context

  return (
    <>
      <h1 className="dashboard-title">Settings</h1>
      <div className="page-content-centered settings-page-container">
        <p className="settings-intro-text">
          Adjust your application settings.
        </p>
        
        <div className="settings-section">
          <h2 className="section-title">Appearance</h2>
          <div className="settings-item">
            <span>Theme:</span>
            <ThemeToggleButton />
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Language</h2>
          <div className="settings-item">
            <span>Current language: <strong>{language === 'en' ? 'English' : 'Français'}</strong></span>
            <button onClick={toggleLanguage} className="settings-button auth-button">
              {language === 'en' ? t('switchToFrench') : t('switchToEnglish')}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Account</h2>
          <p style={{color: 'var(--text-color-secondary)', marginBottom: '1.5rem'}}>Other account settings will go here (e.g., delete account).</p>
           <button className="auth-button delete-button" disabled>Delete Account (Coming Soon)</button>
        </div>

      </div>
    </>
  );
};

export default Settings;