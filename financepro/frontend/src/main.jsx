import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global fetch interceptor to dynamically rewrite localhost API URLs in production
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  let url = typeof input === 'string' ? input : (input && input.url);
  if (typeof url === 'string' && url.startsWith('http://localhost:5000')) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newUrl = url.replace('http://localhost:5000', apiBase);
    if (typeof input === 'string') {
      input = newUrl;
    } else {
      input = new Request(newUrl, input);
    }
  }
  return originalFetch(input, init);
};


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
