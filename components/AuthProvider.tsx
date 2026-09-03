'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { clearToken, getToken, setToken } from '@/lib/session';

interface User {
  id: number;
  email: string;
}

interface LoginResponse {
  access_token: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeUser(token: string): User {
  const payload = JSON.parse(atob(token.split('.')[1]));

  return {
    id: payload.sub,
    email: payload.email,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [token, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken) {
      try {
        const storedUser = decodeUser(storedToken);

        setAuthToken(storedToken);
        setUser(storedUser);
      } catch {
        clearToken();
      }
    }

    setReady(true);
  }, []);

  async function signIn(email: string, password: string) {
    const response = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const newToken = response.access_token;
    const newUser = decodeUser(newToken);

    setToken(newToken);
    setAuthToken(newToken);
    setUser(newUser);

    router.push('/tasks');
  }

  function signOut() {
    clearToken();
    setAuthToken(null);
    setUser(null);
    router.push('/login');
  }

  if (!ready) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}