import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'; // Import LanguageProvider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider> {/* Wrap App with LanguageProvider */}
          <App />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
