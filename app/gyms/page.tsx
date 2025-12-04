'use client';

import { useState, useEffect } from 'react';
import { api, Gym, CreateGymDTO } from '@/lib/api';

export default function GymsPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateGymDTO>({
    name: '',
    type: 'commercial',
    location: '',
    capacity: undefined,
  });

  useEffect(() => {
    loadGyms();
  }, []);

  const loadGyms = async () => {
    try {
      setLoading(true);
      const data = await api.getGyms();
      setGyms(data);
    } catch (error) {
      console.error('Failed to load gyms:', error);
      alert('Failed to load gyms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createGym(formData);
      setShowForm(false);
      setFormData({ name: '', type: 'commercial', location: '', capacity: undefined });
      loadGyms();
    } catch (error) {
      console.error('Failed to create gym:', error);
      alert('Failed to create gym');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gym?')) return;
    try {
      await api.deleteGym(id);
      loadGyms();
    } catch (error) {
      console.error('Failed to delete gym:', error);
      alert('Failed to delete gym');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gyms</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Gym'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full p-2 border rounded"
              >
                <option value="commercial">Commercial</option>
                <option value="home">Home</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity (optional)</label>
              <input
                type="number"
                min="1"
                value={formData.capacity || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Gym
          </button>
        </form>
      )}

      <div className="mb-6">
        <a
          href="/gyms/available"
          className="text-blue-600 hover:underline font-medium"
        >
          View Gyms with Available Spots →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Capacity</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {gyms.map((gym) => (
              <tr key={gym.id} className="border-t">
                <td className="px-4 py-2">{gym.name}</td>
                <td className="px-4 py-2 capitalize">{gym.type}</td>
                <td className="px-4 py-2">{gym.location || 'N/A'}</td>
                <td className="px-4 py-2">{gym.capacity || 'Unlimited'}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(gym.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

