// hooks/useUser.ts
import { useState, useEffect } from 'react';
import { api, User } from '@/lib/api';

export interface UserWithRole extends User {
  role: 'user' | 'manager' | 'admin';
}

export function useUser() {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Assuming your API has an endpoint to get the current user's profile with role
        const userData = await api.getUser();
        setUser(userData);
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