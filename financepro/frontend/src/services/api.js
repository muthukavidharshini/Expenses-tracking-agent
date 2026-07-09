import axios from 'axios';

// Create central Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure automatic retry for temporary network failures
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finance_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // Check if the error is due to a network error or a timeout
    // and if we should retry the request
    const isNetworkError = !error.response && error.code !== 'ERR_CANCELED';
    const isTimeout = error.code === 'ECONNABORTED';
    
    if ((isNetworkError || isTimeout) && config && (!config.__retryCount || config.__retryCount < MAX_RETRIES)) {
      config.__retryCount = config.__retryCount || 0;
      config.__retryCount += 1;
      
      console.warn(`API network failure. Retrying request ${config.url} (${config.__retryCount}/${MAX_RETRIES})...`);
      
      // Delay before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * config.__retryCount));
      
      // Re-execute request with current configuration
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

// Utility helper to get clean, human-readable error messages from responses
export const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with an error status (e.g., 400, 401, 500)
    const data = error.response.data;
    if (data && typeof data === 'object') {
      return data.error || data.message || `Error: ${error.response.status}`;
    }
    return `Server returned error status ${error.response.status}`;
  } else if (error.request) {
    // Request was made but no response was received (e.g. backend offline)
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your network connection and try again.';
    }
    return 'Backend unavailable or network connection failed.';
  } else {
    // Something happened during request setup
    return error.message || 'An unexpected network error occurred.';
  }
};

export default api;
