const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  if (!accessToken) {
    // No access token, redirect to login
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/signin')) {
      window.location.href = '/signin';
    }
    throw new Error('No access token found');
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    ...options.headers as HeadersInit
  });

  // Remove any leading slash from the URL to avoid double slashes
  const apiUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  
  const response = await fetch(apiUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    // Token expired or invalid, try to refresh
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');
      
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshResponse.ok) throw new Error('Failed to refresh token');
      
      const { accessToken: newAccessToken } = await refreshResponse.json();
      localStorage.setItem('accessToken', newAccessToken);
      
      // Retry the original request with the new token
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      return fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      // Clear auth and redirect to login on refresh failure
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('idToken');
        window.location.href = '/signin';
      }
      throw new Error('Session expired. Please sign in again.');
    }
  }

  return response;
};

// Helper function to get the current access token
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
};
