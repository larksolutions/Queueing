import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('http://localhost:5001/api/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('http://localhost:5001/api/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('http://localhost:5001/api/auth/me');
    return response.data;
  },
};

export const queueService = {
  createQueue: async (queueData) => {
    const response = await api.post('http://localhost:5001/api/queue', queueData);
    return response.data;
  },

  getAllQueues: async (status, concernCategory) => {
    let url = 'http://localhost:5001/api/queue?';
    if (status) url += `status=${status}&`;
    if (concernCategory) url += `concernCategory=${concernCategory}`;
    const response = await api.get(url);
    return response.data;
  },

  getQueueStats: async () => {
    const response = await api.get('http://localhost:5001/api/queue/stats');
    return response.data;
  },

  getMyPosition: async (id) => {
    const response = await api.get(`http://localhost:5001/api/queue/my-position/${id}`);
    return response.data;
  },

  updateQueue: async (id, updateData) => {
    const response = await api.put(`http://localhost:5001/api/queue/${id}`, updateData);
    return response.data;
  },

  deleteQueue: async (id) => {
    const response = await api.delete(`http://localhost:5001/api/queue/${id}`);
    return response.data;
  },
};

export const facultyService = {
  getAllFaculty: async (search = '', status = '') => {
    let url = 'http://localhost:5001/api/faculty?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (status) url += `status=${status}`;
    const response = await api.get(url);
    return response.data;
  },

  getFacultyAvailability: async (facultyId) => {
    const response = await api.get(`http://localhost:5001/api/faculty/${facultyId}/availability`);
    return response.data;
  },

  createAvailability: async (availabilityData) => {
    const response = await api.post('http://localhost:5001/api/faculty/availability', availabilityData);
    return response.data;
  },

  updateStatus: async (statusData) => {
    const response = await api.put('http://localhost:5001/api/faculty/status', statusData);
    return response.data;
  },
};
