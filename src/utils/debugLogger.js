// src/utils/debugLogger.js
// Simple logging utility to help debug authentication and API issues

const DEBUG = import.meta.env.DEV; // Only log in development

export const debugLogger = {
  // Log authentication events
  auth: (action, data) => {
    if (!DEBUG) return;
    console.group(`🔐 AUTH: ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.groupEnd();
  },

  // Log API requests
  api: (method, url, data) => {
    if (!DEBUG) return;
    console.group(`🌐 API: ${method.toUpperCase()} ${url}`);
    console.log('Timestamp:', new Date().toISOString());
    if (data) console.log('Payload:', data);
    console.log('Token present:', !!localStorage.getItem('accessToken') || !!document.cookie.includes('refreshToken'));
    console.groupEnd();
  },

  // Log API responses
  apiResponse: (method, url, status, data) => {
    if (!DEBUG) return;
    const emoji = status >= 200 && status < 300 ? '✅' : '❌';
    console.group(`${emoji} API Response: ${method.toUpperCase()} ${url} (${status})`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Status:', status);
    console.log('Data:', data);
    console.groupEnd();
  },

  // Log errors
  error: (context, error) => {
    if (!DEBUG) return;
    console.group(`❌ ERROR: ${context}`);
    console.log('Timestamp:', new Date().toISOString());
    console.error('Error:', error);
    console.log('Stack:', error?.stack);
    console.groupEnd();
  },

  // Log payment events
  payment: (action, data) => {
    if (!DEBUG) return;
    console.group(`💳 PAYMENT: ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.groupEnd();
  },

  // Log general events
  info: (message, data) => {
    if (!DEBUG) return;
    console.group(`ℹ️ INFO: ${message}`);
    console.log('Timestamp:', new Date().toISOString());
    if (data) console.log('Data:', data);
    console.groupEnd();
  }
};

export default debugLogger;