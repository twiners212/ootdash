import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { useAuthStore } from '../store/useAuthStore';
import Mannequin from './Mannequin';
import WeatherInfo from './WeatherInfo';
import RecommendationList from './RecommendationList';
import { RefreshCw, LogOut, User } from 'lucide-react';

// Default coordinates (Salatiga, Central Java)
const DEFAULT_LAT = -7.3305;
const DEFAULT_LON = 110.5084;

export default function Dashboard() {
  const { fetchDashboardData, isLoading, error, clearError, lastFetched } = useDashboardStore();
  const { user, signOut } = useAuthStore();
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lon: DEFAULT_LON });

  // Try to get user's real location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => {
          console.warn('[Geo] Location access denied, using default (Salatiga):', err.message);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

  // Fetch data whenever coords change
  useEffect(() => {
    fetchDashboardData(coords.lat, coords.lon);
  }, [coords.lat, coords.lon, fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(coords.lat, coords.lon);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="font-pixel text-primary animate-pulse text-xl">Loading Data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-6xl mb-8 flex justify-between items-center bg-surface p-4 rounded-xl pixel-border shadow-sm">
        <h1 className="text-3xl font-pixel text-primary tracking-widest drop-shadow-[2px_2px_0_rgba(26,43,69,1)]">OOTDash</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:rotate-180 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={18} />
          </button>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 bg-secondary/80 px-3 py-1.5 rounded-lg">
              <User size={14} className="text-primary" />
              <span className="text-xs text-outline/70 max-w-[120px] truncate hidden sm:inline">{user.email}</span>
              <button
                onClick={signOut}
                className="p-1.5 rounded-md hover:bg-red-100 text-outline/40 hover:text-red-500 transition-all duration-200"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="w-full max-w-6xl mb-4 bg-accent/20 border-2 border-accent px-4 py-3 rounded-lg flex items-center justify-between">
          <span className="text-outline text-sm">{error}</span>
          <button onClick={clearError} className="text-outline/60 hover:text-outline font-bold text-lg">&times;</button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        
        {/* Left Side (Mobile Bottom): Mannequin (60%) */}
        <section className="w-full md:w-[60%] flex flex-col items-center order-2 md:order-1">
          <div className="w-full bg-surface/50 p-6 rounded-2xl pixel-border shadow-lg relative overflow-hidden">
            {/* Background Grid Pattern for retro feel */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#00A8F3 1px, transparent 1px), linear-gradient(90deg, #00A8F3 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <Mannequin />
            </div>
          </div>
        </section>

        {/* Right Side (Mobile Top): Weather & Info (40%) */}
        <section className="w-full md:w-[40%] flex flex-col gap-6 order-1 md:order-2">
          <WeatherInfo />
          <RecommendationList />
        </section>
        
      </main>

      {/* Footer */}
      {lastFetched && (
        <footer className="w-full max-w-6xl mt-8 text-center text-outline/40 text-xs font-pixel">
          Last updated: {new Date(lastFetched).toLocaleTimeString('id-ID').replace(/\./g, ':')}
        </footer>
      )}

    </div>
  );
}
