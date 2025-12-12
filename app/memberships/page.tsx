'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, User, Gym } from '@/lib/api';
import { useUser } from '@/hooks/useUser';

interface Membership {
  id: string;
  userId: string;
  gymId: string;
  joinDate: string;
  gym?: Gym;
  user?: User;
}

export default function MembershipsPage() {
  const { user: currentUser, loading: userLoading } = useUser();
  const [view, setView] = useState<'gyms' | 'members'>('gyms');
  
  // Data State
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [members, setMembers] = useState<{user: User, joinDate: string}[]>([]);
  
  // New State for Available Users Dropdown
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add Member Modal State
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!userLoading && currentUser) {
      loadData();
    }
  }, [userLoading, currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (currentUser?.role === 'USER') {
        const userMemberships = await api.getUserGyms(currentUser.id);
        setGyms(userMemberships);
      } else if (currentUser?.role === 'MANAGER') {
        const managedGyms = await api.getManagedGyms();
        setGyms(managedGyms || []);
      }
      console.log("Loaded gyms:", gyms);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGymClick = async (gym: Gym) => {
    if (currentUser?.role === 'MANAGER') {
      await loadGymMembers(gym);
    }
  };

  const loadGymMembers = async (gym: Gym) => {
    try {
      setLoading(true);
      const gymMembers = await api.getGymMembers(gym.id);
      setMembers(gymMembers);
      setSelectedGym(gym);
      setView('members');
    } catch (err) {
      console.error('Failed to load gym members:', err);
      setError('Failed to load gym members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all users for the dropdown
  const fetchAvailableUsers = async () => {
    try {
      setUsersLoading(true);
      
      // Using the direct API call that works
      const response = await api.getUsers();
      const data = await response; // Ensure we parse JSON here
      setAvailableUsers(data);

    } catch (err) {
      console.error("Error fetching users", err);
      setAddMemberError("Could not load list of users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleOpenAddMemberModal = () => {
    setIsAddMemberModalOpen(true);
    fetchAvailableUsers(); 
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGym || !selectedUserId) return;

    const selectedUser = availableUsers.find(u => u.id === selectedUserId);
    if (!selectedUser) return;

    try {
      setAddMemberLoading(true);
      setAddMemberError(null);
      
      await api.addMemberToGym({
        gymId: selectedGym.id,
        email: selectedUser.email 
      });

      await loadGymMembers(selectedGym);
      setIsAddMemberModalOpen(false);
      setSelectedUserId('');
    } catch (err: any) {
      console.error('Failed to add member:', err);
      setAddMemberError(err.message || 'Failed to add member.');
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleBackToGyms = () => {
    setView('gyms');
    setSelectedGym(null);
    setMembers([]);
  };

  if (userLoading || loading && view === 'gyms') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {view === 'gyms' 
            ? currentUser.role === 'USER' 
              ? 'My Memberships' 
              : 'Managed Gyms'
            : `Members - ${selectedGym?.name}`}
        </h1>
        
        <div className="flex gap-2">
          {view === 'members' && currentUser.role === 'MANAGER' && (
            <button
              onClick={handleOpenAddMemberModal}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <span>+</span> Add Member
            </button>
          )}

          {view === 'members' && (
            <button
              onClick={handleBackToGyms}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      {view === 'gyms' ? (
        <div className="w-full">
          {gyms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-1">No memberships found</h3>
              <p className="text-gray-500">
                {currentUser.role === 'USER' 
                  ? "You haven't joined any gyms yet." 
                  : "You are not managing any gyms."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gyms.map((gym) => (
                <div
                  key={gym.id}
                  onClick={() => handleGymClick(gym)}
                  className={`p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white ${
                    currentUser.role === 'MANAGER' ? 'cursor-pointer hover:border-blue-300 group' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">{gym.name}</h3>
                      <p className="text-gray-600 capitalize text-sm bg-gray-100 inline-block px-2 py-1 rounded mb-2">{gym.type}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2 flex items-center gap-2">
                    <span className="text-gray-400">📍</span>
                    {gym.location || 'No location specified'}
                  </p>
                  
                  {currentUser.role === 'MANAGER' && (
                    <div className="mt-4 pt-4 border-t text-blue-600 font-medium flex items-center text-sm">
                      Manage Members <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  )}
                  
                  {currentUser.role === 'USER' && (
                    <div className="mt-4 pt-4 border-t text-green-600 font-medium flex items-center text-sm">
                       <span className="mr-1">✓</span> Active Membership
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Members List View
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Gym Members Directory
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {members.length} active member{members.length !== 1 && 's'}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            
          </div>
        </div>
      )}

      {/* Add Member Modal (MANAGER Only) */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Add Member to {selectedGym?.name}</h2>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select User
                </label>
                
                {usersLoading ? (
                   <div className="text-sm text-gray-500 py-2">Loading users...</div>
                ) : (
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="" disabled>-- Select a User --</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  Select a registered user to add to this gym.
                </p>
              </div>

              {addMemberError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                  {addMemberError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMemberModalOpen(false);
                    setSelectedUserId('');
                    setAddMemberError(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={addMemberLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMemberLoading || !selectedUserId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {addMemberLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    'Add User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}