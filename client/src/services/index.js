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

  adminLogin: async (credentials) => {
    console.log('🌐 API: Admin login request to /api/auth/admin/login');
    console.log('📤 Credentials:', { email: credentials.email, hasPassword: !!credentials.password });
    try {
      const response = await api.post('http://localhost:5001/api/auth/admin/login', credentials);
      console.log('✅ API: Admin login response received:', response.data);
      if (response.data.token) {
        console.log('💾 Storing token in localStorage');
        localStorage.setItem('token', response.data.token);
      } else {
        console.warn('⚠️ No token in response');
      }
      return response.data;
    } catch (error) {
      console.error('❌ API: Admin login failed:', error);
      console.error('📋 Error details:', error.response?.data);
      throw error;
    }
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

export const scheduleService = {
  // Get all public schedules
  getPublicSchedules: async (startDate = null, endDate = null, facultyId = null) => {
    let url = 'http://localhost:5001/api/schedules/public?';
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    if (facultyId) url += `facultyId=${facultyId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get faculty schedules
  getFacultySchedules: async (facultyId, startDate = null, endDate = null, type = null) => {
    let url = `http://localhost:5001/api/schedules/faculty/${facultyId}?`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    if (type) url += `type=${type}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get my booked schedules
  getMyBookedSchedules: async () => {
    const response = await api.get('http://localhost:5001/api/schedules/my-bookings');
    return response.data;
  },

  // Create a new schedule
  createSchedule: async (scheduleData) => {
    const response = await api.post('http://localhost:5001/api/schedules', scheduleData);
    return response.data;
  },

  // Update schedule
  updateSchedule: async (scheduleId, scheduleData) => {
    const response = await api.put(`http://localhost:5001/api/schedules/${scheduleId}`, scheduleData);
    return response.data;
  },

  // Delete schedule
  deleteSchedule: async (scheduleId) => {
    const response = await api.delete(`http://localhost:5001/api/schedules/${scheduleId}`);
    return response.data;
  },

  // Book a schedule
  bookSchedule: async (scheduleId) => {
    const response = await api.post(`http://localhost:5001/api/schedules/${scheduleId}/book`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (scheduleId) => {
    const response = await api.post(`http://localhost:5001/api/schedules/${scheduleId}/cancel`);
    return response.data;
  },
};

