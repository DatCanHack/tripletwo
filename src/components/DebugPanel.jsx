// src/components/DebugPanel.jsx
import React, { useState } from 'react';
import { api, tokenStore } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

export default function DebugPanel() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkHeaders = async () => {
    setLoading(true);
    try {
      // Call the debug endpoint to see what headers are being sent
      const API_BASE = (
        import.meta.env.VITE_API_URL || 'http://localhost:5500'
      ).replace(/\/+$/, '');
      
      const response = await fetch(`${API_BASE}/debug/headers`, {
        method: 'GET',
        headers: {
          'Authorization': tokenStore.get() ? `Bearer ${tokenStore.get()}` : 'No token',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      setDebugInfo({
        status: response.status,
        headers: data,
        token: tokenStore.get(),
        user: user,
        cookies: document.cookie,
      });
    } catch (error) {
      setDebugInfo({
        error: error.message,
        token: tokenStore.get(),
        user: user,
        cookies: document.cookie,
      });
    } finally {
      setLoading(false);
    }
  };

  const testRefresh = async () => {
    setLoading(true);
    try {
      const refreshResult = await api.refresh();
      const newToken = tokenStore.get();
      setDebugInfo(prev => ({
        ...prev,
        refreshResult,
        newToken,
        refreshTime: new Date().toLocaleTimeString(),
      }));
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        refreshError: error.message,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-md">
        <h3 className="text-white font-semibold mb-2">Debug Panel</h3>
        
        <div className="space-y-2">
          <button
            onClick={checkHeaders}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Headers'}
          </button>
          
          <button
            onClick={testRefresh}
            disabled={loading}
            className="w-full bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            Test Token Refresh
          </button>
        </div>

        {debugInfo && (
          <div className="mt-3 bg-gray-800 p-2 rounded text-xs text-gray-300 max-h-64 overflow-y-auto">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}