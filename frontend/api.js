/**
 * API Service Module
 * Handles all HTTP communication with the backend
 */

const API_URL = 'http://localhost:5000/api';

/**
 * Make an authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  console.log(`[apiRequest] Making request to: ${endpoint}`, options);
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`[apiRequest] Auth token present`);
  } else {
    console.warn(`[apiRequest] WARNING: No auth token found`);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`[apiRequest] Response status: ${response.status}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error(`[apiRequest] HTTP Error: ${response.status}`, error);
      throw {
        status: response.status,
        message: error.message || `HTTP Error ${response.status}`,
        data: error,
      };
    }

    const data = await response.json();
    console.log(`[apiRequest] Response data:`, data);
    return data;
  } catch (error) {
    console.error(`[apiRequest] Request failed:`, error);
    throw error;
  }
}

/**
 * Authentication Service
 */
const authService = {
  async register(userData) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(credentials) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getCurrentUser() {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

/**
 * Vehicle Service
 */
const vehicleService = {
  async getAll() {
    return apiRequest('/vehicles/', {
      method: 'GET',
    });
  },

  async getById(id) {
    return apiRequest(`/vehicles/${id}`, {
      method: 'GET',
    });
  },

  async create(vehicleData) {
    return apiRequest('/vehicles/', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  },

  async update(id, vehicleData) {
    return apiRequest(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  },

  async delete(id) {
    return apiRequest(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Driver Service
 */
const driverService = {
  async getAll() {
    return apiRequest('/drivers/', {
      method: 'GET',
    });
  },

  async getById(id) {
    return apiRequest(`/drivers/${id}`, {
      method: 'GET',
    });
  },

  async create(driverData) {
    return apiRequest('/drivers/', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  },

  async update(id, driverData) {
    return apiRequest(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData),
    });
  },

  async delete(id) {
    return apiRequest(`/drivers/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * User Service
 */
const userService = {
  async getAll() {
    return apiRequest('/users/', {
      method: 'GET',
    });
  },

  async updateRole(phone, role) {
    return apiRequest(`/users/${phone}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  async delete(phone) {
    return apiRequest(`/users/${phone}`, {
      method: 'DELETE',
    });
  },
};
