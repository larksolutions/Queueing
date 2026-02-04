import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('https://cicsqrqueueing.vercel.app/api/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('https://cicsqrqueueing.vercel.app/api/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  adminLogin: async (credentials) => {
    console.log('🌐 API: Admin login request to /api/auth/admin/login');
    console.log('📤 Credentials:', { email: credentials.email, hasPassword: !!credentials.password });
    try {
      const response = await api.post('https://cicsqrqueueing.vercel.app/api/auth/admin/login', credentials);
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
    const response = await api.get('https://cicsqrqueueing.vercel.app/api/auth/me');
    return response.data;
  },
};

export const queueService = {
  createQueue: async (queueData) => {
    const response = await api.post('https://cicsqrqueueing.vercel.app/api/queue', queueData);
    return response.data;
  },

  getAllQueues: async (status, concernCategory) => {
    let url = 'https://cicsqrqueueing.vercel.app/api/queue?';
    if (status) url += `status=${status}&`;
    if (concernCategory) url += `concernCategory=${concernCategory}`;
    const response = await api.get(url);
    return response.data;
  },

  getQueueStats: async () => {
    const response = await api.get('https://cicsqrqueueing.vercel.app/api/queue/stats');
    return response.data;
  },

  getMyPosition: async (id) => {
    const response = await api.get(`https://cicsqrqueueing.vercel.app/api/queue/my-position/${id}`);
    return response.data;
  },

  updateQueue: async (id, updateData) => {
    const response = await api.put(`https://cicsqrqueueing.vercel.app/api/queue/${id}`, updateData);
    return response.data;
  },

  deleteQueue: async (id) => {
    const response = await api.delete(`https://cicsqrqueueing.vercel.app/api/queue/${id}`);
    return response.data;
  },
};

export const facultyService = {
  getAllFaculty: async (search = '', status = '') => {
    let url = 'https://cicsqrqueueing.vercel.app/api/faculty?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (status) url += `status=${status}`;
    const response = await api.get(url);
    return response.data;
  },

  getFacultyAvailability: async (facultyId) => {
    const response = await api.get(`https://cicsqrqueueing.vercel.app/api/faculty/${facultyId}/availability`);
    return response.data;
  },

  createAvailability: async (availabilityData) => {
    const response = await api.post('https://cicsqrqueueing.vercel.app/api/faculty/availability', availabilityData);
    return response.data;
  },

  updateStatus: async (statusData) => {
    const response = await api.put('https://cicsqrqueueing.vercel.app/api/faculty/status', statusData);
    return response.data;
  },
};

export const scheduleService = {
  // Get all public schedules
  getPublicSchedules: async (startDate = null, endDate = null, facultyId = null) => {
    let url = 'https://cicsqrqueueing.vercel.app/api/schedules/public?';
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    if (facultyId) url += `facultyId=${facultyId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get faculty schedules
  getFacultySchedules: async (facultyId, startDate = null, endDate = null, type = null) => {
    let url = `https://cicsqrqueueing.vercel.app/api/schedules/faculty/${facultyId}?`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    if (type) url += `type=${type}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get my booked schedules
  getMyBookedSchedules: async () => {
    const response = await api.get('https://cicsqrqueueing.vercel.app/api/schedules/my-bookings');
    return response.data;
  },

  // Create a new schedule
  createSchedule: async (scheduleData) => {
    const response = await api.post('https://cicsqrqueueing.vercel.app/api/schedules', scheduleData);
    return response.data;
  },

  // Update schedule
  updateSchedule: async (scheduleId, scheduleData) => {
    const response = await api.put(`https://cicsqrqueueing.vercel.app/api/schedules/${scheduleId}`, scheduleData);
    return response.data;
  },

  // Delete schedule
  deleteSchedule: async (scheduleId) => {
    const response = await api.delete(`https://cicsqrqueueing.vercel.app/api/schedules/${scheduleId}`);
    return response.data;
  },

  // Book a schedule
  bookSchedule: async (scheduleId) => {
    const response = await api.post(`https://cicsqrqueueing.vercel.app/api/schedules/${scheduleId}/book`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (scheduleId) => {
    const response = await api.post(`https://cicsqrqueueing.vercel.app/api/schedules/${scheduleId}/cancel`);
    return response.data;
  },
};

export const adminService = {
  // Get all students
  getAllStudents: async (search = '', page = 1, limit = 20) => {
    let url = `https://cicsqrqueueing.vercel.app/api/admin/students?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get student by ID
  getStudentById: async (studentId) => {
    const response = await api.get(`https://cicsqrqueueing.vercel.app/api/admin/students/${studentId}`);
    return response.data;
  },

  // Get all faculty (admin view)
  getAllFacultyAdmin: async (search = '', status = '', page = 1, limit = 20) => {
    let url = `https://cicsqrqueueing.vercel.app/api/admin/faculty?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${status}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get faculty by ID
  getFacultyById: async (facultyId) => {
    const response = await api.get(`https://cicsqrqueueing.vercel.app/api/admin/faculty/${facultyId}`);
    return response.data;
  },

  // Get system analytics
  getSystemAnalytics: async (startDate = null, endDate = null) => {
    let url = 'https://cicsqrqueueing.vercel.app/api/admin/analytics?';
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}`;
    const response = await api.get(url);
    return response.data;
  },
};

