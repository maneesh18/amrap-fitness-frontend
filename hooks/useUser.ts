// hooks/useUser.ts
import { useState, useEffect } from 'react';
import { api, User } from '@/lib/api';

export interface UserWithRole extends User {
  role: 'USER' | 'MANAGER';
}

export function useUser() {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Get user data from the API
        const userData = await api.getUser();
        
        // Add a default role of 'USER' if not provided by the API
        const userWithRole: UserWithRole = {
          ...userData,
          role: (userData as any).role || 'USER' // Default to 'USER' if role is not provided
        };
        
        setUser(userWithRole);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}