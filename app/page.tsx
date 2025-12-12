'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  fitnessGoal: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Gym {
  id: string;
  name: string;
  type: string;
  location: string | null;
  capacity: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          
          // Fetch user profile
          const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!profileResponse.ok) {
            throw new Error('Failed to fetch profile');
          }
          
          const userData = await profileResponse.json();
          setProfile(userData);

          // If user is a regular user, fetch their gym memberships
          if (userData.role === 'USER') {
            const membershipsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memberships/my-gyms`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (membershipsResponse.ok) {
              const gymsData = await membershipsResponse.json();
              setGyms(Array.isArray(gymsData) ? gymsData : []);
            }
          }
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load profile data');
          console.error('Error fetching data:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Fitness Platform</h1>
          <div className="space-y-4">
            <Link 
              href="/signin" 
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
            <p className="text-center text-gray-600">or</p>
            <Link 
              href="/signup" 
              className="block w-full bg-green-600 text-white py-2 px-4 rounded text-center hover:bg-green-700 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="text-center py-8">No profile data available</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-lg mb-2"><span className="font-semibold">Name:</span> {profile.name}</p>
          <p className="text-lg mb-2"><span className="font-semibold">Email:</span> {profile.email}</p>
          <p className="text-lg mb-2"><span className="font-semibold">Fitness Goal:</span> {profile.fitnessGoal?.toLowerCase()}</p>
          <p className="text-lg"><span className="font-semibold">Role:</span> {profile.role?.toLowerCase()}</p>
        </div>
      </div>
      
    </div>
  );
}
