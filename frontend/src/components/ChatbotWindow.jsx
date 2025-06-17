import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const ChatbotWindow = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 'initial',
          sender: 'bot',
          text: t('chatbotWelcomeMessage') || 'Hello! How can I help you with your finances today?'
        }
      ]);
    }
  }, [isOpen, t]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessage = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Replace with your actual backend endpoint for the chatbot
      const response = await fetch('/api/chatbot/query', { // Placeholder endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input, history: messages }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to get response from chatbot');
      }

      const data = await response.json();
      const botResponse = { id: Date.now().toString() + '-bot', sender: 'bot', text: data.reply };
      setMessages(prevMessages => [...prevMessages, botResponse]);

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorResponse = {
        id: Date.now().toString() + '-error',
        sender: 'bot',
        text: t('chatbotErrorMessage') || 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-window">
      <div className="chatbot-header">
        <h3>{t('aiFinancialAssistant') || 'AI Financial Assistant'}</h3>
        <button onClick={onClose} className="chatbot-close-button" aria-label={t('closeChat') || 'Close chat'}>&times;</button>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          placeholder={t('typeYourMessage') || 'Type your message...'}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>
          {isLoading ? (t('sending') || 'Sending...') : (t('send') || 'Send')}
        </button>
      </div>
    </div>
  );
};

export default ChatbotWindow;
