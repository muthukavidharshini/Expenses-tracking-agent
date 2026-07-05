import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global fetch interceptor to dynamically rewrite localhost API URLs in production
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  if (typeof input === 'string' && input.startsWith('http://localhost:5000')) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    input = input.replace('http://localhost:5000', apiBase);
  }
  return originalFetch(input, init);
};


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
