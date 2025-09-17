// API baz URL-i (tam baza, daxilində `/api` olmalıdır)
// Prioritet: VITE_API_URL -> production fallback -> local dev
const resolveApiBaseUrl = () => {
  try {
    const envUrl = typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env.VITE_API_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
      return envUrl.replace(/\/$/, '');
    }
  } catch (_) {}

  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    return 'https://office-admin-panel.onrender.com/api';
  }

  // Lokal inkişaf: backend `backend/server.js` default 3001 port
  return 'http://localhost:3001/api';
};

const API_BASE_URL = resolveApiBaseUrl();

// localStorage API service
const localStorageAPI = {
  // Auth functions
  login: async (credentials) => {
    const users = JSON.parse(localStorage.getItem('officeUsers') || '[]');
    const user = users.find(u => 
      (u.username === credentials.username || u.email === credentials.username) && 
      u.password === credentials.password
    );
    
    if (user) {
      const token = btoa(JSON.stringify({ id: user.id, username: user.username }));
      localStorage.setItem('token', token);
      return { success: true, token, user };
    }
    return { success: false, message: 'Email və ya şifrə yanlışdır!' };
  },

  logout: () => {
    localStorage.removeItem('token');
    return { success: true };
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = JSON.parse(atob(token));
        return { success: true, user: userData };
      } catch (e) {
        return { success: false };
      }
    }
    return { success: false };
  },

  // Users functions
  getUsers: () => {
    const users = JSON.parse(localStorage.getItem('officeUsers') || '[]');
    return { success: true, data: users };
  },

  createUser: (userData) => {
    const users = JSON.parse(localStorage.getItem('officeUsers') || '[]');
    const newUser = {
      id: Date.now(),
      ...userData,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('officeUsers', JSON.stringify(users));
    return { success: true, data: newUser };
  },

  updateUser: (id, userData) => {
    const users = JSON.parse(localStorage.getItem('officeUsers') || '[]');
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...userData, updated_at: new Date().toISOString() };
      localStorage.setItem('officeUsers', JSON.stringify(users));
      return { success: true, data: users[index] };
    }
    return { success: false, message: 'User tapılmadı' };
  },

  deleteUser: (id) => {
    const users = JSON.parse(localStorage.getItem('officeUsers') || '[]');
    const filteredUsers = users.filter(u => u.id !== id);
    localStorage.setItem('officeUsers', JSON.stringify(filteredUsers));
    return { success: true };
  }
};

// Check if we should use localStorage API
const useLocalStorage = false; // Use backend API

// Initialize default admin user
const initializeDefaultUser = () => {
  const users = JSON.parse(localStorage.getItem('officeUsers') || '[]');
  if (users.length === 0) {
    const adminUser = {
      id: 1,
      username: 'admin',
      email: 'admin@deposist.az',
      password: 'admin123',
      role: 'admin',
      created_at: new Date().toISOString()
    };
    users.push(adminUser);
    localStorage.setItem('officeUsers', JSON.stringify(users));
  }
};

// Initialize on load
initializeDefaultUser();

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to set auth token
const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// Helper function to remove auth token
const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API xətası baş verdi');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      setAuthToken(data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    
    return data;
  },

  logout: () => {
    removeAuthToken();
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: async () => {
    return await apiRequest('/auth/me');
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    return await apiRequest('/users');
  },

  getById: async (id) => {
    return await apiRequest(`/users/${id}`);
  },

  create: async (userData) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Roles API
export const rolesAPI = {
  getAll: async () => {
    return await apiRequest('/roles');
  },
};

// Inquiries API
export const inquiriesAPI = {
  getAll: async () => {
    return await apiRequest('/inquiries');
  },
};

// Meetings API
export const meetingsAPI = {
  getAll: async () => {
    return await apiRequest('/meetings');
  },
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    return await apiRequest('/projects');
  },
};

// Pricing API
export const pricingAPI = {
  getAll: async () => {
    return await apiRequest('/pricing');
  },
};

export { getAuthToken, setAuthToken, removeAuthToken };





