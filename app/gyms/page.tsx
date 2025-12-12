'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, Gym, CreateGymDTO } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

function GymsPageContent() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateGymDTO>({
    name: '',
    type: 'commercial',
    location: '',
    capacity: undefined,
  });
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user role from localStorage or API
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.role);
          }
        }

        // Load all gyms
        const gymsData = await api.getGyms();
        setGyms(Array.isArray(gymsData) ? gymsData : []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createGym(formData);
      setShowForm(false);
      setFormData({ name: '', type: 'commercial', location: '', capacity: undefined });
      
      // Refresh gyms list
      const gymsData = await api.getGyms();
      setGyms(Array.isArray(gymsData) ? gymsData : []);
    } catch (error) {
      console.error('Failed to create gym:', error);
      alert('Failed to create gym');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gyms</h1>
        {userRole === 'MANAGER' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Gym'}
          </button>
        )}
      </div>

      {showForm && userRole === 'MANAGER' && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Add New Gym</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Enter gym name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="commercial">Commercial</option>
                <option value="home">Home</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location (optional)</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Enter location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity (optional)</label>
              <input
                type="number"
                min="1"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || undefined })}
                className="w-full p-2 border rounded"
                placeholder="Enter capacity"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Gym
            </button>
          </div>
        </form>
      )}

      {gyms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No gyms found</h3>
          {userRole === 'MANAGER' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Your First Gym
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gyms.map((gym) => (
            <div key={gym.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-2">{gym.name}</h3>
              <p className="text-gray-600 mb-1">Type: {gym.type.toLowerCase()}</p>
              {gym.location && <p className="text-gray-600 mb-1">Location: {gym.location}</p>}
              {gym.capacity && <p className="text-gray-600">Capacity: {gym.capacity}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GymsPage() {
  return (
    <ProtectedRoute>
      <GymsPageContent />
    </ProtectedRoute>
  );
}

