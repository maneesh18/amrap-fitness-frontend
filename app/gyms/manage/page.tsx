'use client';

import { useState, useEffect } from 'react';
import { api, Gym } from '@/lib/api';
import Link from 'next/link';

export default function ManageGymsPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingGym, setIsAddingGym] = useState(false);
  const [newGym, setNewGym] = useState({
    name: '',
    type: 'commercial' as const,
    location: '',
    capacity: ''
  });

  useEffect(() => {
    loadGyms();
  }, []);

  const loadGyms = async () => {
    try {
      setLoading(true);
      const data = await api.getGyms();
      setGyms(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load gyms:', err);
      setError('Failed to load gyms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGym = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gymData = {
        name: newGym.name,
        type: newGym.type,
        location: newGym.location || undefined,
        capacity: newGym.capacity ? parseInt(newGym.capacity) : undefined
      };
      
      await api.createGym(gymData);
      setNewGym({ name: '', type: 'commercial', location: '', capacity: '' });
      setIsAddingGym(false);
      await loadGyms();
    } catch (err) {
      console.error('Failed to add gym:', err);
      setError('Failed to add gym. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Gyms</h1>
        <div className="space-x-4">
          <Link 
            href="/gyms" 
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            View Available Gyms
          </Link>
          <button
            onClick={() => setIsAddingGym(!isAddingGym)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isAddingGym ? 'Cancel' : 'Add New Gym'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isAddingGym && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Gym</h2>
          <form onSubmit={handleAddGym} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={newGym.name}
                onChange={(e) => setNewGym({...newGym, name: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={newGym.type}
                onChange={(e) => setNewGym({...newGym, type: e.target.value as any})}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="commercial">Commercial</option>
                <option value="home">Home</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={newGym.location}
                onChange={(e) => setNewGym({...newGym, location: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., 123 Main St, City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                min="1"
                value={newGym.capacity}
                onChange={(e) => setNewGym({...newGym, capacity: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingGym(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Gym
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg font-medium leading-6 text-gray-900">All Gyms</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            List of all gyms in the system
          </p>
        </div>
        
        {gyms.length === 0 ? (
          <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
            No gyms found. Add your first gym to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gyms.map((gym) => (
                  <tr key={gym.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{gym.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 capitalize">{gym.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{gym.location || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{gym.capacity || 'Unlimited'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
