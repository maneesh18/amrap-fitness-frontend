'use client';

import { useState, useEffect } from 'react';
import { api, GymWithAvailability } from '@/lib/api';

export default function AvailableGymsPage() {
  const [gyms, setGyms] = useState<GymWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGyms();
  }, []);

  const loadGyms = async () => {
    try {
      setLoading(true);
      const data = await api.getGymsWithAvailableSpots();
      setGyms(data);
    } catch (error) {
      console.error('Failed to load gyms:', error);
      alert('Failed to load gyms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gyms with Available Spots</h1>
        <a href="/gyms" className="text-blue-600 hover:underline">
          ← Back to Gyms
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Current Members</th>
              <th className="px-4 py-2 text-left">Capacity</th>
              <th className="px-4 py-2 text-left">Available Spots</th>
            </tr>
          </thead>
          <tbody>
            {gyms.map((item) => (
              <tr key={item.gym.id} className="border-t">
                <td className="px-4 py-2">{item.gym.name}</td>
                <td className="px-4 py-2 capitalize">{item.gym.type}</td>
                <td className="px-4 py-2">{item.gym.location || 'N/A'}</td>
                <td className="px-4 py-2">{item.currentCount}</td>
                <td className="px-4 py-2">{item.gym.capacity || 'Unlimited'}</td>
                <td className="px-4 py-2 font-semibold text-green-600">
                  {item.availableSpots}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {gyms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No gyms with available spots found
          </div>
        )}
      </div>
    </div>
  );
}

