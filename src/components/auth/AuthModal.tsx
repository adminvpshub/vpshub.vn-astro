
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Github, Mail } from 'lucide-react';
import { login, socialLogin } from '../../lib/auth';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  translations: Record<string, string>;
}

// Inner component to use the Google hook
const AuthModalContent: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, translations }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });

  const googleLogin = useGoogleLogin({
    // Removed flow: 'auth-code' to default to implicit flow for access_token
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // Fetch user info to get the email
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoResponse.json();

        // Pass the access token and email to the auth handler
        await socialLogin('google', tokenResponse.access_token, userInfo.email);
        onLoginSuccess();
        onClose();
      } catch (error) {
        console.error('Google login failed', error);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => console.error('Google Login Error:', error),
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.username, formData.password);
      onLoginSuccess();
      onClose();
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    if (provider === 'google') {
      googleLogin();
      return;
    }

    setIsLoading(true);
    try {
      await socialLogin(provider);
      onLoginSuccess();
      onClose();
    } catch (error) {
      console.error('Social login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLoginMode ? translations['auth.login_title'] : translations['auth.register_title']}
            </h2>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-lg bg-white p-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#24292F] p-2.5 text-sm font-medium text-white hover:bg-[#24292F]/90 transition-colors disabled:opacity-50"
            >
              <Github className="h-5 w-5" />
              Github
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-900 px-2 text-slate-400">
                {translations['auth.or_continue_with']}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {translations['auth.email']}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg bg-slate-800 border border-white/10 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="name@example.com"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {translations['auth.username']}
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full rounded-lg bg-slate-800 border border-white/10 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={translations['auth.username']}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {translations['auth.password']}
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg bg-slate-800 border border-white/10 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? '...' : (isLoginMode ? translations['auth.submit_login'] : translations['auth.submit_register'])}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isLoginMode ? translations['auth.no_account'] : translations['auth.have_account']}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Wrapper to provide context
const AuthModal: React.FC<AuthModalProps> = (props) => {
  if (!props.isOpen) return null;
  return (
    <GoogleOAuthProvider clientId="191036157586-7ioan5ct6dd23qfqqk728pip3tvpt0p2.apps.googleusercontent.com">
      <AuthModalContent {...props} />
    </GoogleOAuthProvider>
  );
};

export default AuthModal;
