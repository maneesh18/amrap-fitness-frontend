const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  userId: string;
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

// List of public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/users/signin',
  '/users/signup',
  '/users/verify',
  '/users/verify-email',
  '/users/forgot-password',
  '/users/reset-password'
];

class ApiClient {
  private accessToken: string | null = null;

  // Method to set the access token
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private isPublicEndpoint(endpoint: string): boolean {
    return PUBLIC_ENDPOINTS.some(publicEndpoint => 
      endpoint.startsWith(publicEndpoint)
    );
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    // Add Authorization header for protected endpoints
    if (!this.isPublicEndpoint(endpoint) && this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Important for cookies if using httpOnly tokens
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
    console.log('Calling /api/users/all-users');
    return this.request<User[]>('/api/users/all-users');
  }

  async getUser(): Promise<User> {
    return this.request<User>(`/api/users`);
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Gyms
  async getGyms(): Promise<Gym[]> {
    return this.request<Gym[]>('/api/gyms');
  }

  async getGym(id: string): Promise<Gym> {
    return this.request<Gym>(`/api/gyms/${id}`);
  }

  async createGym(data: CreateGymDTO): Promise<Gym> {
    return this.request<Gym>('/api/gyms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGym(id: string, data: UpdateGymDTO): Promise<Gym> {
    return this.request<Gym>(`/api/gyms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGym(id: string): Promise<void> {
    return this.request<void>(`/api/gyms/${id}`, {
      method: 'DELETE',
    });
  }

  async getGymsWithAvailableSpots(): Promise<GymWithAvailability[]> {
    return this.request<GymWithAvailability[]>('/api/gyms/available-spots');
  }

  // Memberships
  async addUserToGym(data: CreateMembershipDTO): Promise<Membership> {
    return this.request<Membership>('/api/memberships', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeUserFromGym(userId: string, gymId: string): Promise<void> {
    return this.request<void>(`/api/memberships/users/${userId}/gyms/${gymId}`, {
      method: 'DELETE',
    });
  }

  async getGymUsers(gymId: string): Promise<User[]> {
    return this.request<User[]>(`/api/memberships/gyms/${gymId}/users`);
  }

  async getUserGyms(userId: string): Promise<Gym[]> {
    return this.request<Gym[]>(`/api/memberships/users/${userId}/gyms`);
  }
  async getUserMemberships(userId: string): Promise<{gym: Gym, joinDate: string}[]> {
    return this.request<{gym: Gym, joinDate: string}[]>(`/api/users/${userId}/memberships`);
  }
  async getManagedGyms(): Promise<Gym[]> {
    return this.request<Gym[]>(`/api/gyms`);
  }
  async getGymMembers(gymId: string): Promise<{user: User, joinDate: string}[]> {
    return this.request<{user: User, joinDate: string}[]>(`/api/memberships/gyms/${gymId}/users`);
  }
}

export const api = new ApiClient();

export const setApiAccessToken = (token: string | null) => {
  api.setAccessToken(token);
};

