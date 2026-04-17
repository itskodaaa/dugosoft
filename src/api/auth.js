const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/auth';

export const authApi = {
  async register({ email, password, firstName, lastName }) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  async login({ email, password }) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },

  async getMe() {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user data');
    }
    return data;
  },

  async updateProfile(profileData) {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }
    return data;
  },

  async updatePassword({ currentPassword, newPassword }) {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL.replace('/auth', '/auth/security')}/password`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update password');
    }
    return data;
  }
};
