
export interface User {
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'vpshub_auth_token';
const USER_KEY = 'vpshub_auth_user';

// Mock Token Generation
const generateToken = () => {
  return 'mock_token_' + Math.random().toString(36).substr(2) + '_' + Date.now();
};

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock successful login for any input
  const token = generateToken();
  const username = email.split('@')[0];
  const user: User = {
    username,
    email,
  };

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return { user, token };
};

export const socialLogin = async (provider: 'google' | 'github', providerToken?: string, email?: string): Promise<{ user: User; token: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (provider === 'google' && providerToken) {
    console.log("Passing Google token to backend:", providerToken);
  }

  const token = generateToken();
  const user: User = {
    username: `${provider}_user`,
    email: email || `user@${provider}.com`,
  };

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return { user, token };
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
     return { user: null, token: null, isAuthenticated: false };
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { user, token, isAuthenticated: true };
    } catch (e) {
      // Invalid user data
      logout();
    }
  }

  return { user: null, token: null, isAuthenticated: false };
};
