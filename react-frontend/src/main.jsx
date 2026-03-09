import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { appLogger } from './utils/logger'
import './utils/debugHelper' // Import debug helper to make it available globally

// Initialize logging
appLogger.info('🚀 React Frontend Application Starting...');
appLogger.debug('Environment:', {
  nodeEnv: import.meta.env.MODE,
  apiUrl: import.meta.env.VITE_API_URL || '/api',
});

// Log when app is ready
window.addEventListener('load', () => {
  appLogger.info('✅ Application fully loaded');
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
