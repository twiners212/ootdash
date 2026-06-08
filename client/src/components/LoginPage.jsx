import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LogIn, UserPlus, Mail, Lock, ArrowRight, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signUp, isLoading, error, clearError, isOffline } = useAuthStore();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password) {
      setLocalError('Email dan password harus diisi');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setLocalError('Password minimal 6 karakter');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Password tidak cocok');
        return;
      }
      const result = await signUp(email, password);
      if (!result.success) {
        setLocalError(result.error);
      }
    } else {
      const result = await signIn(email, password);
      if (!result.success) {
        setLocalError(result.error);
      }
    }
  };

  const handleDemoLogin = async () => {
    setLocalError('');
    clearError();
    const demoEmail = isOffline ? 'demo@ootdash.local' : 'test@ootdash.local';
    const demoPassword = isOffline ? 'demopassword' : 'test1234';
    const result = await signIn(demoEmail, demoPassword);
    if (!result.success) {
      setLocalError(result.error);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setLocalError('');
    clearError();
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Grid */}
      <div 
        className="absolute inset-0 opacity-[0.06]"
        style={{ 
          backgroundImage: 'linear-gradient(#00A8F3 1px, transparent 1px), linear-gradient(90deg, #00A8F3 1px, transparent 1px)', 
          backgroundSize: '24px 24px',
          animation: 'grid-move 20s linear infinite'
        }}
      />

      {/* Floating Pixel Decorations */}
      <div className="absolute top-10 left-10 text-6xl animate-bounce opacity-30" style={{ animationDuration: '3s' }}>☁️</div>
      <div className="absolute top-20 right-20 text-4xl animate-bounce opacity-20" style={{ animationDuration: '4s', animationDelay: '1s' }}>⛅</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-bounce opacity-25" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>🌤️</div>
      <div className="absolute bottom-10 right-10 text-4xl animate-bounce opacity-20" style={{ animationDuration: '4.5s', animationDelay: '2s' }}>🌈</div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-pixel text-primary drop-shadow-[3px_3px_0_rgba(26,43,69,1)] mb-3 tracking-wider">
            OOTDash
          </h1>
          <p className="text-outline/60 text-sm font-medium">
            Outfit Of The Day — Dashboard Cuaca & Rekomendasi Pakaian
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl pixel-border shadow-2xl shadow-outline/10 overflow-hidden">
          
          {/* Tab Switcher */}
          <div className="flex border-b-2 border-outline/10">
            <button
              onClick={() => { setMode('login'); setLocalError(''); clearError(); }}
              className={`flex-1 py-4 px-4 font-pixel text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2
                ${mode === 'login' 
                  ? 'text-primary bg-primary/5 border-b-2 border-primary -mb-[2px]' 
                  : 'text-outline/40 hover:text-outline/60'
                }`}
            >
              <LogIn size={14} /> Masuk
            </button>
            <button
              onClick={() => { setMode('register'); setLocalError(''); clearError(); }}
              className={`flex-1 py-4 px-4 font-pixel text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2
                ${mode === 'register' 
                  ? 'text-primary bg-primary/5 border-b-2 border-primary -mb-[2px]' 
                  : 'text-outline/40 hover:text-outline/60'
                }`}
            >
              <UserPlus size={14} /> Daftar
            </button>
          </div>

          {/* Offline Mode Banner */}
          {isOffline && (
            <div className="mx-6 mt-4 flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-xs font-pixel animate-fade-in-up">
              <AlertTriangle size={14} className="flex-shrink-0 text-amber-500 animate-pulse" />
              <span>Demo Mode Aktif (DB Offline)</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Error Display */}
            {displayError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in-up">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-pixel text-[10px] text-outline/60 uppercase tracking-wider block">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline/30" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-secondary/50 border-2 border-outline/10 rounded-lg 
                    text-outline placeholder:text-outline/30 
                    focus:border-primary focus:bg-white focus:outline-none
                    transition-all duration-200"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="font-pixel text-[10px] text-outline/60 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline/30" />
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-secondary/50 border-2 border-outline/10 rounded-lg 
                    text-outline placeholder:text-outline/30 
                    focus:border-primary focus:bg-white focus:outline-none
                    transition-all duration-200"
                  disabled={isLoading}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {mode === 'register' && (
              <div className="space-y-2 animate-fade-in-up">
                <label className="font-pixel text-[10px] text-outline/60 uppercase tracking-wider block">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline/30" />
                  <input
                    id="auth-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border-2 border-outline/10 rounded-lg 
                      text-outline placeholder:text-outline/30 
                      focus:border-primary focus:bg-white focus:outline-none
                      transition-all duration-200"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-pixel text-xs uppercase tracking-wider
                rounded-lg pixel-border transition-all duration-200 
                hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/30
                active:translate-y-[1px] active:shadow-sm
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Masuk' : 'Daftar'} <ArrowRight size={14} />
                </>
              )}
            </button>

            {/* Divider */}
            {mode === 'login' && (
              <div className="flex items-center gap-3 my-2 opacity-50">
                <div className="h-[1px] bg-outline/20 flex-grow" />
                <span className="font-pixel text-[8px] text-outline/40">atau</span>
                <div className="h-[1px] bg-outline/20 flex-grow" />
              </div>
            )}

            {/* Quick Demo Button */}
            {mode === 'login' && (
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-pixel text-xs uppercase tracking-wider
                  rounded-lg pixel-border transition-all duration-200 
                  hover:translate-y-[-2px] hover:shadow-lg hover:shadow-amber-500/30
                  active:translate-y-[1px] active:shadow-sm
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                Coba Akun Demo <LogIn size={14} />
              </button>
            )}
          </form>

          {/* Footer Link */}
          <div className="px-6 pb-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-outline/50 hover:text-primary transition-colors"
              disabled={isLoading}
            >
              {mode === 'login' 
                ? 'Belum punya akun? Daftar di sini' 
                : 'Sudah punya akun? Masuk di sini'}
            </button>
          </div>
        </div>

        {/* Version Badge */}
        <div className="text-center mt-6">
          <span className="font-pixel text-[8px] text-outline/30 uppercase tracking-widest">
            OOTDash v1.0-alpha • Powered by Supabase
          </span>
        </div>
      </div>
    </div>
  );
}
