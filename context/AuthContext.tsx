'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { setApiAccessToken } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (accessToken: string) => void;
  logout: () => void;
  loading: boolean;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        setApiAccessToken(accessToken);
        setIsAuthenticated(true);
      } else {
        setApiAccessToken(null);
        setIsAuthenticated(false);
      }
      
      // Redirect to login if not authenticated and not on a public route
      const publicRoutes = ['/signin', '/signup', '/verify'];
      if (!accessToken && !publicRoutes.some(route => pathname.startsWith(route))) {
        router.push('/signin');
      } else if (accessToken && (pathname === '/signin' || pathname === '/signup')) {
        router.push('/');
      }
      setLoading(false);
    }
  }, [pathname, router]);

  const login = (accessToken: string) => {
    // The tokens are already stored in localStorage by the signin page
    setApiAccessToken(accessToken);
    setIsAuthenticated(true);
    router.push('/');
  };

  const logout = async () => {
    try {
      // Call the logout API endpoint
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        credentials: 'include' // Important for clearing httpOnly cookies
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('Logout failed:', error.message || 'Unknown error');
        // Continue with local logout even if server logout fails
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with local logout even if there's an error
    } finally {
      // Clear all auth related items from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      setApiAccessToken(null);
      setIsAuthenticated(false);
      router.push('/signin');
    }
  };

  const getAccessToken = () => {
    return localStorage.getItem('accessToken');
  };

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
