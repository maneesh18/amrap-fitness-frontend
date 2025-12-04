const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  fitnessGoal: 'strength' | 'hypertrophy' | 'endurance';
  createdAt: string;
  updatedAt: string;
}

export interface Gym {
  id: string;
  name: string;
  type: 'commercial' | 'home' | 'apartment';
  location: string | null;
  capacity: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  gymId: string;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  dateOfBirth: string;
  fitnessGoal: 'strength' | 'hypertrophy' | 'endurance';
}

export interface UpdateUserDTO {
  name?: string;
  dateOfBirth?: string;
  fitnessGoal?: 'strength' | 'hypertrophy' | 'endurance';
}

export interface CreateGymDTO {
  name: string;
  type: 'commercial' | 'home' | 'apartment';
  location?: string;
  capacity?: number;
}

export interface UpdateGymDTO {
  name?: string;
  type?: 'commercial' | 'home' | 'apartment';
  location?: string | null;
  capacity?: number | null;
}

export interface CreateMembershipDTO {
  userId: string;
  gymId: string;
}

export interface GymWithAvailability {
  gym: Gym;
  availableSpots: number | null;
  currentCount: number;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Gyms
  async getGyms(): Promise<Gym[]> {
    return this.request<Gym[]>('/gyms');
  }

  async getGym(id: string): Promise<Gym> {
    return this.request<Gym>(`/gyms/${id}`);
  }

  async createGym(data: CreateGymDTO): Promise<Gym> {
    return this.request<Gym>('/gyms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGym(id: string, data: UpdateGymDTO): Promise<Gym> {
    return this.request<Gym>(`/gyms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGym(id: string): Promise<void> {
    return this.request<void>(`/gyms/${id}`, {
      method: 'DELETE',
    });
  }

  async getGymsWithAvailableSpots(): Promise<GymWithAvailability[]> {
    return this.request<GymWithAvailability[]>('/gyms/available-spots');
  }

  // Memberships
  async addUserToGym(data: CreateMembershipDTO): Promise<Membership> {
    return this.request<Membership>('/memberships', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeUserFromGym(userId: string, gymId: string): Promise<void> {
    return this.request<void>(`/memberships/users/${userId}/gyms/${gymId}`, {
      method: 'DELETE',
    });
  }

  async getGymUsers(gymId: string): Promise<User[]> {
    return this.request<User[]>(`/memberships/gyms/${gymId}/users`);
  }

  async getUserGyms(userId: string): Promise<Gym[]> {
    return this.request<Gym[]>(`/memberships/users/${userId}/gyms`);
  }
}

export const api = new ApiClient();

