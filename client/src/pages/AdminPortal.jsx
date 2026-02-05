import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { queueService, facultyService, scheduleService, adminService } from '../services';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AdminPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Overview data
  const [stats, setStats] = useState([]);
  const [queues, setQueues] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [schedules, setSchedules] = useState([]);
  
  // Student & Faculty Management
  const [students, setStudents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit/Delete modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState(null);
  
  // Filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedFaculty, setSelectedFaculty] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, queuesRes, facultyRes] = await Promise.all([
        queueService.getQueueStats(),
        queueService.getAllQueues('', ''),
        facultyService.getAllFaculty()
      ]);
      setStats(statsRes.data || []);
      setQueues(queuesRes.data || []);
      setFaculty(facultyRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await scheduleService.getPublicSchedules(
        dateRange.startDate,
        dateRange.endDate,
        selectedFaculty || null
      );
      setSchedules(response || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await adminService.getAllStudents(searchTerm);
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchFacultyList = async () => {
    try {
      const response = await adminService.getAllFacultyAdmin(searchTerm);
      setFacultyList(response.data || []);
    } catch (error) {
      console.error('Error fetching faculty list:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      console.log('📊 Fetching analytics data...');
      const response = await adminService.getSystemAnalytics(
        dateRange.startDate,
        dateRange.endDate
      );
      console.log('✅ Analytics response:', response);
      console.log('📈 Queue trends data:', response.data?.queueTrends);
      setAnalyticsData(response.data || null);
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'schedules') {
      fetchSchedules();
    } else if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'faculty-management') {
      fetchFacultyList();
    } else if (activeTab === 'reports') {
      fetchAnalytics();
    }
  }, [activeTab, dateRange, selectedFaculty, searchTerm]);

  // Calculate analytics
  const calculateAnalytics = () => {
    const totalQueues = queues.length;
    const completedQueues = queues.filter(q => q.status === 'completed').length;
    const activeQueues = queues.filter(q => ['waiting', 'in-progress'].includes(q.status)).length;
    const cancelledQueues = queues.filter(q => q.status === 'cancelled').length;
    const rescheduledQueues = queues.filter(q => q.status === 'rescheduled').length;
    const declinedQueues = queues.filter(q => q.status === 'declined').length;
    
    const avgWaitTime = queues.reduce((acc, q) => {
      if (q.estimatedWaitTime) return acc + q.estimatedWaitTime;
      return acc;
    }, 0) / (totalQueues || 1);

    const categoryBreakdown = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.total;
      return acc;
    }, {});

    const facultyAvailability = {
      available: faculty.filter(f => f.availabilityStatus === 'available').length,
      busy: faculty.filter(f => f.availabilityStatus === 'busy').length,
      offline: faculty.filter(f => f.availabilityStatus === 'offline').length,
    };

    return {
      totalQueues,
      completedQueues,
      activeQueues,
      cancelledQueues,
      rescheduledQueues,
      declinedQueues,
      avgWaitTime: Math.round(avgWaitTime),
      completionRate: totalQueues > 0 ? Math.round((completedQueues / totalQueues) * 100) : 0,
      categoryBreakdown,
      facultyAvailability
    };
  };

  const queueAnalytics = calculateAnalytics();

  const getStatusColor = (status) => {
    const colors = {
      waiting: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      rescheduled: 'bg-purple-100 text-purple-800 border-purple-300',
      declined: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      studentId: user.studentId || '',
      facultyId: user.facultyId || '',
      department: user.department || '',
      specialization: user.specialization || '',
      officeLocation: user.officeLocation || '',
      isEnrolled: user.isEnrolled || false,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateUser(editingUser._id, editFormData);
      setShowEditModal(false);
      setEditingUser(null);
      // Refresh the list
      if (activeTab === 'student-management') {
        fetchStudents();
      } else if (activeTab === 'faculty-management') {
        fetchFacultyList();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await adminService.deleteUser(deletingUser._id);
      setShowDeleteModal(false);
      setDeletingUser(null);
      // Refresh the list
      if (activeTab === 'student-management') {
        fetchStudents();
      } else if (activeTab === 'faculty-management') {
        fetchFacultyList();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };


  const getCategoryColor = (category) => {
    const colors = {
      ID: 'bg-purple-100 text-purple-800',
      OJT: 'bg-indigo-100 text-indigo-800',
      Capstone: 'bg-blue-100 text-blue-800',
      'Staff/Admin': 'bg-green-100 text-green-800',
      Enrollment: 'bg-orange-100 text-orange-800',
      Other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      reportTitle: 'CICS Queueing System - Accreditation Report',
      dateRange,
      analytics,
      queues: queues.map(q => ({
        queueNumber: q.queueNumber,
        student: q.student?.name,
        studentEmail: q.student?.email,
        category: q.concernCategory,
        status: q.status,
        remarks: q.remarks || 'N/A',
        checkInTime: q.checkInTime,
        startTime: q.startTime || 'N/A',
        completedTime: q.completedTime || 'N/A',
        faculty: q.faculty?.name || 'Unassigned',
        priority: q.priority || 'normal'
      })),
      faculty: faculty.map(f => ({
        name: f.name,
        email: f.email,
        status: f.availabilityStatus,
        specialization: f.specialization
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const exportCSV = () => {
    const csvHeaders = [
      'Queue #',
      'Student Name',
      'Student Email',
      'Category',
      'Status',
      'Remarks',
      'Check-in Time',
      'Start Time',
      'Completed Time',
      'Faculty',
      'Priority'
    ];

    const csvRows = queues.map(q => [
      q.queueNumber,
      q.student?.name || 'N/A',
      q.student?.email || 'N/A',
      q.concernCategory,
      q.status,
      (q.remarks || 'N/A').replace(/,/g, ';'),
      new Date(q.checkInTime).toLocaleString(),
      q.startTime ? new Date(q.startTime).toLocaleString() : 'N/A',
      q.completedTime ? new Date(q.completedTime).toLocaleString() : 'N/A',
      q.faculty?.name || 'Unassigned',
      q.priority || 'normal'
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cics-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'queue-monitor', label: 'Queue Monitor', icon: '👥' },
    { id: 'students', label: 'Students', icon: '🎓' },
    { id: 'faculty-management', label: 'Faculty', icon: '👨‍🏫' },
    { id: 'schedules', label: 'Schedules', icon: '📅' },
    { id: 'reports', label: 'Reports', icon: '📈' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-indigo-900 text-white transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col`}>
        {/* Logo/Brand */}
        <div className="p-4 border-b border-indigo-800">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-xl font-bold">CICS</h2>
                <p className="text-xs text-indigo-300">Queueing System</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded hover:bg-indigo-800 transition"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-indigo-800">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-indigo-300 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="CICS Logo" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {menuItems.find(item => item.id === activeTab)?.label || 'Admin Portal'}
                </h1>
                <p className="text-sm text-gray-600">CICS Queueing System - Administrator Dashboard</p>
              </div>
            </div>
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Admin Permissions</p>
                <p>✓ View faculty schedules | ✓ Monitor queue flow | ✓ Access reports</p>
                <p className="mt-1">✗ Cannot modify faculty availability | ✗ Cannot interfere with faculty queues</p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Queues</p>
                    <p className="text-3xl font-bold text-gray-900">{queueAnalytics.totalQueues}</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Queues</p>
                    <p className="text-3xl font-bold text-blue-600">{queueAnalytics.activeQueues}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                    <p className="text-3xl font-bold text-green-600">{queueAnalytics.completionRate}%</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Wait Time</p>
                    <p className="text-3xl font-bold text-orange-600">{queueAnalytics.avgWaitTime}m</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Queue by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(queueAnalytics.categoryBreakdown).map(([category, count]) => (
                  <div key={category} className="text-center">
                    <div className={`px-3 py-2 rounded-lg ${getCategoryColor(category)}`}>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs mt-1">{category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Faculty Availability */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty Availability Status</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{queueAnalytics.facultyAvailability.available}</p>
                  <p className="text-sm text-gray-600 mt-1">Available</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-600">{queueAnalytics.facultyAvailability.busy}</p>
                  <p className="text-sm text-gray-600 mt-1">Busy</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-600">{queueAnalytics.facultyAvailability.offline}</p>
                  <p className="text-sm text-gray-600 mt-1">Offline</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'queue-monitor' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Live Queue Monitor (Read-Only)</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor queue flow in real-time. Updates every 30 seconds.</p>
            </div>
            <div className="p-6">
              {queues.length > 0 ? (
                <div className="space-y-3">
                  {queues.slice(0, 20).map((queue) => (
                    <div key={queue._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-indigo-600">#{queue.queueNumber}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(queue.status)}`}>
                              {queue.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(queue.concernCategory)}`}>
                              {queue.concernCategory}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p><strong>Student:</strong> {queue.student?.name} ({queue.student?.email})</p>
                            <p><strong>Purpose:</strong> {queue.purpose}</p>
                            {queue.faculty && <p><strong>Assigned Faculty:</strong> {queue.faculty.name}</p>}
                            <p><strong>Check-in:</strong> {new Date(queue.checkInTime).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No active queues at the moment</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
                  <select
                    value={selectedFaculty}
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Faculty</option>
                    {faculty.map((f) => (
                      <option key={f._id} value={f._id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Schedules List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty Schedules (Read-Only View)</h3>
              {schedules.length > 0 ? (
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div key={schedule._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{schedule.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Faculty:</strong> {schedule.faculty?.name} | <strong>Type:</strong> {schedule.type}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Time:</strong> {new Date(schedule.startTime).toLocaleString()} - {new Date(schedule.endTime).toLocaleString()}
                          </p>
                          {schedule.location && <p className="text-sm text-gray-600"><strong>Location:</strong> {schedule.location}</p>}
                          {schedule.bookedStudents?.length > 0 && (
                            <p className="text-sm text-gray-600">
                              <strong>Bookings:</strong> {schedule.bookedStudents.length} / {schedule.maxStudents || 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No schedules found for selected criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>
                  <p className="text-sm text-gray-600 mt-1">View and search all registered students</p>
                </div>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="p-6">
              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.studentId || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.department || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${student.isEnrolled ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                              {student.isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditUser(student)}
                                className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1"
                                title="Edit Student"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(student)}
                                className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1"
                                title="Delete Student"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No students found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'faculty-management' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Faculty Management</h3>
                  <p className="text-sm text-gray-600 mt-1">View and manage faculty information and availability</p>
                </div>
                <input
                  type="text"
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="p-6">
              {facultyList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {facultyList.map((f) => (
                    <div key={f._id} className="border rounded-lg p-6 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-2xl">👨‍🏫</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{f.name}</h4>
                            <p className="text-xs text-gray-500">{f.facultyId || 'N/A'}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          f.availabilityStatus === 'available' ? 'bg-green-100 text-green-800' :
                          f.availabilityStatus === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {f.availabilityStatus}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p><strong>Email:</strong> {f.email}</p>
                        <p><strong>Specialization:</strong> {f.specialization || 'N/A'}</p>
                        <p><strong>Office:</strong> {f.officeLocation || 'N/A'}</p>
                        <p><strong>Department:</strong> {f.department || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleEditUser(f)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(f)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No faculty members found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Date Range Filter */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range Filter</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setDateRange({
                      startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
                      endDate: today
                    });
                  }}
                  className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setDateRange({
                      startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
                      endDate: today
                    });
                  }}
                  className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
                    setDateRange({
                      startDate: firstDayOfMonth,
                      endDate: today
                    });
                  }}
                  className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  This Month
                </button>
              </div>
            </div>

            {/* Analytics Graphs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Queue Trends Over Time</h3>
              <p className="text-sm text-gray-600 mb-4">
                Showing data from {dateRange.startDate} to {dateRange.endDate}
              </p>
              
              {/* Debug Info */}
              {!analyticsData && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">⏳ Loading analytics data...</p>
                </div>
              )}
              
              {analyticsData && !analyticsData.queueTrends && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">⚠️ No queue trends data available</p>
                  <p className="text-xs text-yellow-600 mt-1">Data received: {JSON.stringify(Object.keys(analyticsData))}</p>
                </div>
              )}
              
              {analyticsData && analyticsData.queueTrends && analyticsData.queueTrends.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">ℹ️ No queue data available for the selected date range</p>
                  <p className="text-xs text-blue-600 mt-1">Try selecting a different date range or create some queues first.</p>
                </div>
              )}
              
              {analyticsData && analyticsData.queueTrends && analyticsData.queueTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.queueTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id.date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#8b5cf6" name="Total Queues" strokeWidth={2} />
                    <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" strokeWidth={2} />
                    <Line type="monotone" dataKey="rescheduled" stroke="#f59e0b" name="Rescheduled" strokeWidth={2} />
                    <Line type="monotone" dataKey="declined" stroke="#ef4444" name="Declined" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : null}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Reports for Evaluation & Accreditation</h3>
              
              {/* Export Button */}
              <div className="mb-6 flex gap-3">
                <button
                  onClick={exportReport}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Full Report (JSON)
                </button>
                <button
                  onClick={exportCSV}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export as CSV
                </button>
              </div>

              {/* Summary Statistics */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Queue Performance Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><strong>Total Queues Processed:</strong> {queueAnalytics.totalQueues}</p>
                    <p className="text-sm"><strong>Completed:</strong> {queueAnalytics.completedQueues} ({queueAnalytics.completionRate}%)</p>
                    <p className="text-sm"><strong>Rescheduled:</strong> {queueAnalytics.rescheduledQueues}</p>
                    <p className="text-sm"><strong>Declined:</strong> {queueAnalytics.declinedQueues}</p>
                    <p className="text-sm"><strong>Cancelled:</strong> {queueAnalytics.cancelledQueues}</p>
                    <p className="text-sm"><strong>Currently Active:</strong> {queueAnalytics.activeQueues}</p>
                    <p className="text-sm"><strong>Average Wait Time:</strong> {queueAnalytics.avgWaitTime} minutes</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Faculty Performance</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm mb-2"><strong>Total Faculty Members:</strong> {faculty.length}</p>
                    <div className="space-y-2">
                      {faculty.map((f) => (
                        <div key={f._id} className="text-sm flex justify-between items-center border-b border-gray-200 pb-2">
                          <span>{f.name}</span>
                          <span className="text-gray-600">{f.specialization || 'N/A'}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            f.availabilityStatus === 'available' ? 'bg-green-100 text-green-800' :
                            f.availabilityStatus === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {f.availabilityStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Category Distribution</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(queueAnalytics.categoryBreakdown).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center text-sm">
                        <span>{category}:</span>
                        <span className="font-semibold">{count} queues</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> This report contains aggregate data for evaluation and accreditation purposes. 
                    Detailed analytics and time-series data can be exported using the button above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">Edit {editingUser.role === 'student' ? 'Student' : 'Faculty'}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {editingUser.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    <input
                      type="text"
                      value={editFormData.studentId}
                      onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isEnrolled"
                      checked={editFormData.isEnrolled}
                      onChange={(e) => setEditFormData({ ...editFormData, isEnrolled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="isEnrolled" className="text-sm font-medium text-gray-700">
                      Enrolled Student (Full Access)
                    </label>
                  </div>
                </>
              )}

              {editingUser.role === 'faculty' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty ID</label>
                    <input
                      type="text"
                      value={editFormData.facultyId}
                      onChange={(e) => setEditFormData({ ...editFormData, facultyId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={editFormData.specialization}
                      onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Office Location</label>
                    <input
                      type="text"
                      value={editFormData.officeLocation}
                      onChange={(e) => setEditFormData({ ...editFormData, officeLocation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 px-6 py-5 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">Confirm Delete</h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-red-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-900 font-semibold mb-2">
                    Are you sure you want to delete this {deletingUser.role}?
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <strong>Name:</strong> {deletingUser.name}
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    <strong>Email:</strong> {deletingUser.email}
                  </p>
                  <p className="text-red-600 text-sm font-medium">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPortal;
