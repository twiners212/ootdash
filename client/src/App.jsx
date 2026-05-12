import React, { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';

function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  // Initialize auth on app mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <h1 className="font-pixel text-primary text-lg animate-pulse">OOTDash</h1>
          <p className="text-outline/40 text-sm">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated ? <Dashboard /> : <LoginPage />}
    </div>
  );
}

export default App;
