import React from 'react';
import { useLanguage } from '../context/LanguageContext';
// import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid'; // Example using Heroicons

const ChatbotIcon = ({ onClick }) => {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      className="chatbot-icon"
      title={t('chatWithAIAssistant') || 'Chat with AI Assistant'}
      aria-label={t('chatWithAIAssistant') || 'Chat with AI Assistant'}
    >
      {/* Using a simple SVG as a placeholder. Replace with a proper icon library if available */}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.006 3 11.5c0 2.581.858 4.953 2.285 6.715L3 21l2.754-1.652A9.043 9.043 0 0 0 7.5 19.87M12 20.25a9.005 9.005 0 0 0 4.215-1.122M12 20.25c-.39 0-.773-.02-.115-.058M12 20.25c-.39 0-.773-.02-1.15-.058m1.15.058V12m0 8.25a9.005 9.005 0 0 1-4.215-1.122m5.365-7.128a3 3 0 1 0-5.365-2.122m5.365 2.122a3 3 0 0 0-2.122 5.365m0 0a3 3 0 0 0 5.365 2.122M9.878 11.622a3 3 0 1 0-2.122-5.365m2.122 5.365a3 3 0 0 1 5.365 2.122" />
      </svg>
    </button>
  );
};

export default ChatbotIcon;
