// LocalStorage-based API (Backend olmadan)
const API_BASE_URL = 'local'; // Local storage istifadə et

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

// Local storage API simulation
const localAPI = {
  // Users
  users: {
    getAll: () => JSON.parse(localStorage.getItem('officeUsers') || '[]'),
    create: (user) => {
      const users = JSON.parse(localStorage.getItem('officeUsers') || '[]');
      const newUser = { ...user, id: Date.now() };
      users.push(newUser);
      localStorage.setItem('officeUsers', JSON.stringify(users));
      return newUser;
    },
    update: (id, userData) => {
      const users = JSON.parse(localStorage.getItem('officeUsers') || '[]');
      const index = users.findIndex(u => u.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...userData };
        localStorage.setItem('officeUsers', JSON.stringify(users));
        return users[index];
      }
      throw new Error('User not found');
    },
    delete: (id) => {
      const users = JSON.parse(localStorage.getItem('officeUsers') || '[]');
      const filtered = users.filter(u => u.id !== id);
      localStorage.setItem('officeUsers', JSON.stringify(filtered));
      return true;
    }
  },

  // Inquiries
  inquiries: {
    getAll: () => JSON.parse(localStorage.getItem('officeInquiries') || '[]'),
    create: (inquiry) => {
      const inquiries = JSON.parse(localStorage.getItem('officeInquiries') || '[]');
      const newInquiry = { ...inquiry, id: Date.now() };
      inquiries.push(newInquiry);
      localStorage.setItem('officeInquiries', JSON.stringify(inquiries));
      return newInquiry;
    },
    update: (id, inquiryData) => {
      const inquiries = JSON.parse(localStorage.getItem('officeInquiries') || '[]');
      const index = inquiries.findIndex(i => i.id === id);
      if (index !== -1) {
        inquiries[index] = { ...inquiries[index], ...inquiryData };
        localStorage.setItem('officeInquiries', JSON.stringify(inquiries));
        return inquiries[index];
      }
      throw new Error('Inquiry not found');
    }
  },

  // Meetings
  meetings: {
    getAll: () => JSON.parse(localStorage.getItem('officeMeetings') || '[]'),
    create: (meeting) => {
      const meetings = JSON.parse(localStorage.getItem('officeMeetings') || '[]');
      const newMeeting = { ...meeting, id: Date.now() };
      meetings.push(newMeeting);
      localStorage.setItem('officeMeetings', JSON.stringify(meetings));
      return newMeeting;
    },
    update: (id, meetingData) => {
      const meetings = JSON.parse(localStorage.getItem('officeMeetings') || '[]');
      const index = meetings.findIndex(m => m.id === id);
      if (index !== -1) {
        meetings[index] = { ...meetings[index], ...meetingData };
        localStorage.setItem('officeMeetings', JSON.stringify(meetings));
        return meetings[index];
      }
      throw new Error('Meeting not found');
    }
  },

  // Projects
  projects: {
    getAll: () => JSON.parse(localStorage.getItem('officeProjects') || '[]'),
    create: (project) => {
      const projects = JSON.parse(localStorage.getItem('officeProjects') || '[]');
      const newProject = { ...project, id: Date.now() };
      projects.push(newProject);
      localStorage.setItem('officeProjects', JSON.stringify(projects));
      return newProject;
    },
    update: (id, projectData) => {
      const projects = JSON.parse(localStorage.getItem('officeProjects') || '[]');
      const index = projects.findIndex(p => p.id === id);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...projectData };
        localStorage.setItem('officeProjects', JSON.stringify(projects));
        return projects[index];
      }
      throw new Error('Project not found');
    }
  },

  // Pricing
  pricing: {
    getAll: () => JSON.parse(localStorage.getItem('officePricing') || '[]'),
    create: (pricing) => {
      const pricings = JSON.parse(localStorage.getItem('officePricing') || '[]');
      const newPricing = { ...pricing, id: Date.now() };
      pricings.push(newPricing);
      localStorage.setItem('officePricing', JSON.stringify(pricings));
      return newPricing;
    },
    update: (id, pricingData) => {
      const pricings = JSON.parse(localStorage.getItem('officePricing') || '[]');
      const index = pricings.findIndex(p => p.id === id);
      if (index !== -1) {
        pricings[index] = { ...pricings[index], ...pricingData };
        localStorage.setItem('officePricing', JSON.stringify(pricings));
        return pricings[index];
      }
      throw new Error('Pricing not found');
    }
  }
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const [resource, action] = endpoint.split('/').slice(1);
  
  if (options.method === 'POST') {
    const data = JSON.parse(options.body);
    return localAPI[resource].create(data);
  } else if (options.method === 'PUT') {
    const data = JSON.parse(options.body);
    const id = parseInt(endpoint.split('/').pop());
    return localAPI[resource].update(id, data);
  } else if (options.method === 'DELETE') {
    const id = parseInt(endpoint.split('/').pop());
    return localAPI[resource].delete(id);
  } else {
    return localAPI[resource].getAll();
  }
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    // Demo user
    if (email === 'admin@office.com' && password === 'admin123') {
      const token = 'demo-token-' + Date.now();
      const user = { id: 1, email, name: 'Admin', role: 'admin' };
      setAuthToken(token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { token, user };
    }
    throw new Error('Invalid credentials');
  },

  logout: () => {
    removeAuthToken();
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: async () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },
};

// Export all APIs
export const usersAPI = {
  getAll: () => apiRequest('/api/users'),
  create: (userData) => apiRequest('/api/users', { method: 'POST', body: JSON.stringify(userData) }),
  update: (id, userData) => apiRequest(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  delete: (id) => apiRequest(`/api/users/${id}`, { method: 'DELETE' }),
};

export const inquiriesAPI = {
  getAll: () => apiRequest('/api/inquiries'),
  create: (inquiryData) => apiRequest('/api/inquiries', { method: 'POST', body: JSON.stringify(inquiryData) }),
  update: (id, inquiryData) => apiRequest(`/api/inquiries/${id}`, { method: 'PUT', body: JSON.stringify(inquiryData) }),
};

export const meetingsAPI = {
  getAll: () => apiRequest('/api/meetings'),
  create: (meetingData) => apiRequest('/api/meetings', { method: 'POST', body: JSON.stringify(meetingData) }),
  update: (id, meetingData) => apiRequest(`/api/meetings/${id}`, { method: 'PUT', body: JSON.stringify(meetingData) }),
};

export const projectsAPI = {
  getAll: () => apiRequest('/api/projects'),
  create: (projectData) => apiRequest('/api/projects', { method: 'POST', body: JSON.stringify(projectData) }),
  update: (id, projectData) => apiRequest(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(projectData) }),
};

export const pricingAPI = {
  getAll: () => apiRequest('/api/pricing'),
  create: (pricingData) => apiRequest('/api/pricing', { method: 'POST', body: JSON.stringify(pricingData) }),
  update: (id, pricingData) => apiRequest(`/api/pricing/${id}`, { method: 'PUT', body: JSON.stringify(pricingData) }),
};

export { getAuthToken, setAuthToken, removeAuthToken };

