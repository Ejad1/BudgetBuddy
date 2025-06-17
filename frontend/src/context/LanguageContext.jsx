// filepath: d:\Programmation\React\BudgetBuddy\frontend\src\context\LanguageContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('budgetbuddy_lang') || 'en'); // Default to English

  useEffect(() => {
    localStorage.setItem('budgetbuddy_lang', language);
    document.documentElement.lang = language; // Set lang attribute on HTML element
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'en' ? 'fr' : 'en'));
  };

  // Basic translations (extend this as needed)
  // In a larger app, you'd use a library like i18next
  const translations = {
    en: {
      dashboard: 'Dashboard',
      profile: 'Profile',
      reports: 'Reports',
      budgets: 'Budgets',
      categories: 'Categories',
      settings: 'Settings',
      logout: 'Logout',
      // Add more translations here
      predictiveSpendingAnalysis: 'Predictive Spending Analysis',
      anomalyDetection: 'Anomaly Detection & Unusual Spending Habits',
      personalizedBudgetOptimization: 'Personalized Budget Optimization',
      financialBehavioralNudges: 'Financial Behavioral Nudges',
      anonymousBenchmarking: 'Anonymous Benchmarking & Intelligent Comparison',
      loadingSpendingPredictions: 'Loading spending predictions...',
      // ... other report section titles and messages
      language: 'Language',
      switchToFrench: 'Switch to French',
      switchToEnglish: 'Switch to English',
      // Chatbot translations
      chatWithAssistant: 'Chat with our AI assistant',
      chatbotPlaceholder: 'Type your message here...',
      send: 'Send',
      chatbotLoading: 'Assistant is typing...',
      chatbotWelcome: 'Hello! How can I help you today?',
      clearChat: 'Clear Chat',
      closeChat: 'Close Chat',
      // New translations for Reports page charts
      spendingForecastChartTitle: 'Spending Forecast (Actual vs. Predicted)',
      date: 'Date',
      amountCurrency: 'Amount ({currency})',
      predictedTotalSpendingNextMonth: 'Predicted Total Spending Next Month',
      predictedCashFlowNext30Days: 'Predicted Cash Flow (Next 30 Days)',
      potentialOverdraftWarning: 'Potential Overdraft Warning',
      notEnoughDataForChart: 'Not enough data to display chart.',
      notEnoughDataForPrediction: 'Not enough data for a detailed prediction.',
    },
    fr: {
      dashboard: 'Tableau de Bord',
      profile: 'Profil',
      reports: 'Rapports',
      budgets: 'Budgets',
      categories: 'Catégories',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      // Add more translations here
      predictiveSpendingAnalysis: 'Analyse Prédictive des Dépenses',
      anomalyDetection: 'Détection d\'Anomalies et Habitudes de Dépenses Inhabituelles',
      personalizedBudgetOptimization: 'Optimisation de Budget Personnalisée',
      financialBehavioralNudges: 'Nudges Comportementaux Financiers',
      anonymousBenchmarking: 'Comparaison Anonymisée et Benchmarking Intelligent',
      loadingSpendingPredictions: 'Chargement des prédictions de dépenses...',
      // ... other report section titles and messages
      language: 'Langue',
      switchToFrench: 'Passer en Français',
      switchToEnglish: 'Passer en Anglais',
      // Chatbot translations
      chatWithAssistant: 'Discutez avec notre assistant IA',
      chatbotPlaceholder: 'Écrivez votre message ici...',
      send: 'Envoyer',
      chatbotLoading: 'L\'assistant écrit...',
      chatbotWelcome: 'Bonjour ! Comment puis-je vous aider aujourd\\\'hui ?',
      clearChat: 'Effacer la discussion',
      closeChat: 'Fermer le chat',
      // New translations for Reports page charts
      spendingForecastChartTitle: 'Prévision des Dépenses (Réel vs. Prédit)',
      date: 'Date',
      amountCurrency: 'Montant ({currency})',
      predictedTotalSpendingNextMonth: 'Dépenses totales prévues pour le mois prochain',
      predictedCashFlowNext30Days: 'Flux de trésorerie prévus (30 prochains jours)',
      potentialOverdraftWarning: 'Avertissement de découvert potentiel',
      notEnoughDataForChart: 'Pas assez de données pour afficher le graphique.',
      notEnoughDataForPrediction: 'Pas assez de données pour une prédiction détaillée.',
    }
  };

  const t = (key, params = {}) => {
    let translation = translations[language][key] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(new RegExp(`\\\\{${paramKey}\\\\}`, 'g'), params[paramKey]);
      });
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
