/**
 * Configuration file for AI Assistant Extension
 * Edit this file to change backend API endpoint
 */

const CONFIG = {
  // Backend API endpoint
  BACKEND_URL: 'https://ai-extension-api.duckdns.org',
  
  // API endpoints
  API: {
    GENERATE: '/api/generate'
  },
  
  // Timeout settings (milliseconds)
  REQUEST_TIMEOUT: 30000,
  
  // Default settings
  DEFAULTS: {
    PROMPT: 'Translate to Vietnamese'
  }
};

// Make config available globally
window.AI_EXTENSION_CONFIG = CONFIG;
