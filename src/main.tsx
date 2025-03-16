import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize dark mode from localStorage
const initializeDarkMode = () => {
  const savedMode = localStorage.getItem('darkMode');
  const isDarkMode = savedMode ? JSON.parse(savedMode) : false;
  
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

initializeDarkMode();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
