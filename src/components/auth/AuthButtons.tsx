
import React, { useState, useEffect } from 'react';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { getAuthState, logout, type AuthState } from '../../lib/auth';
import AuthModal from './AuthModal';

interface AuthButtonsProps {
  translations: Record<string, string>;
  initialLang: string;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ translations, initialLang }) => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, token: null, isAuthenticated: false });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check auth state on mount
    setAuthState(getAuthState());
    setIsLoaded(true);
  }, []);

  const handleLoginSuccess = () => {
    setAuthState(getAuthState());
    // Optional: Refresh page or trigger other updates
  };

  const handleLogout = () => {
    logout();
    setAuthState({ user: null, token: null, isAuthenticated: false });
  };

  // Avoid hydration mismatch by not rendering until loaded on client
  // or render a placeholder that matches server-side structure if possible.
  // Here we'll just render the buttons once mounted to ensure state is accurate.
  if (!isLoaded) {
    // Return a skeleton or invisible placeholder to prevent layout shift
    // Or render the logged-out state by default (matches SSR likely)
    return (
       <div className="flex items-center gap-4 animate-pulse opacity-0">
          <div className="h-9 w-20 bg-slate-800 rounded"></div>
       </div>
    );
  }

  // Use dynamic href for better accessibility and verification
  const dashboardUrl = authState.token
    ? `https://identity.vpshub.vn?token=${authState.token}`
    : 'https://identity.vpshub.vn';

  return (
    <>
      {authState.isAuthenticated ? (
        <div className="flex items-center gap-4">
          <a
            href={dashboardUrl}
            className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            {translations['auth.dashboard']}
          </a>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-300 hover:text-red-400 flex items-center gap-2 transition-colors"
            title={translations['auth.logout']}
          >
             <LogOut className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-medium text-slate-300 hover:text-white hidden md:block"
          >
            {translations['nav.login']}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50"
          >
            {translations['nav.signup']}
          </button>
        </div>
      )}

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        translations={translations}
      />
    </>
  );
};

export default AuthButtons;
