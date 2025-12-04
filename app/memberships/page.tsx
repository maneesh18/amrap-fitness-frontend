'use client';

import { useState, useEffect } from 'react';
import { api, User, Gym, CreateMembershipDTO } from '@/lib/api';

export default function MembershipsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateMembershipDTO>({
    userId: '',
    gymId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, gymsData] = await Promise.all([
        api.getUsers(),
        api.getGyms(),
      ]);
      setUsers(usersData);
      setGyms(gymsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addUserToGym(formData);
      setShowForm(false);
      setFormData({ userId: '', gymId: '' });
      alert('User added to gym successfully!');
    } catch (error: any) {
      console.error('Failed to create membership:', error);
      alert(error.message || 'Failed to create membership');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Memberships</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Membership'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">User</label>
              <select
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gym</label>
              <select
                required
                value={formData.gymId}
                onChange={(e) => setFormData({ ...formData, gymId: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a gym</option>
                {gyms.map((gym) => (
                  <option key={gym.id} value={gym.id}>
                    {gym.name} ({gym.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Membership
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Users and Their Gyms</h2>
          <div className="space-y-4">
            {users.map((user) => (
              <UserGymsCard key={user.id} user={user} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Gyms and Their Members</h2>
          <div className="space-y-4">
            {gyms.map((gym) => (
              <GymUsersCard key={gym.id} gym={gym} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserGymsCard({ user }: { user: User }) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGyms();
  }, []);

  const loadGyms = async () => {
    try {
      setLoading(true);
      const data = await api.getUserGyms(user.id);
      setGyms(data);
    } catch (error) {
      console.error('Failed to load gyms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (gymId: string) => {
    if (!confirm('Remove user from this gym?')) return;
    try {
      await api.removeUserFromGym(user.id, gymId);
      loadGyms();
    } catch (error) {
      console.error('Failed to remove membership:', error);
      alert('Failed to remove membership');
    }
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="font-semibold">{user.name}</h3>
      <p className="text-sm text-gray-600">{user.email}</p>
      {loading ? (
        <p className="text-sm text-gray-500 mt-2">Loading...</p>
      ) : (
        <div className="mt-2">
          {gyms.length === 0 ? (
            <p className="text-sm text-gray-500">No gym memberships</p>
          ) : (
            <ul className="text-sm space-y-1">
              {gyms.map((gym) => (
                <li key={gym.id} className="flex justify-between items-center">
                  <span>{gym.name}</span>
                  <button
                    onClick={() => handleRemove(gym.id)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function GymUsersCard({ gym }: { gym: Gym }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getGymUsers(gym.id);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove user from this gym?')) return;
    try {
      await api.removeUserFromGym(userId, gym.id);
      loadUsers();
    } catch (error) {
      console.error('Failed to remove membership:', error);
      alert('Failed to remove membership');
    }
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="font-semibold">{gym.name}</h3>
      <p className="text-sm text-gray-600">
        {gym.type} • {gym.capacity ? `Capacity: ${gym.capacity}` : 'Unlimited capacity'}
      </p>
      {loading ? (
        <p className="text-sm text-gray-500 mt-2">Loading...</p>
      ) : (
        <div className="mt-2">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">No members</p>
          ) : (
            <ul className="text-sm space-y-1">
              {users.map((user) => (
                <li key={user.id} className="flex justify-between items-center">
                  <span>{user.name}</span>
                  <button
                    onClick={() => handleRemove(user.id)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

