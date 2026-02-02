import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { queueService, facultyService, scheduleService } from '../services';
import { useAuth } from '../context/AuthContext';

function AdminPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Overview data
  const [stats, setStats] = useState([]);
  const [queues, setQueues] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [schedules, setSchedules] = useState([]);
  
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

  useEffect(() => {
    if (activeTab === 'schedules') {
      fetchSchedules();
    }
  }, [activeTab, dateRange, selectedFaculty]);

  // Calculate analytics
  const calculateAnalytics = () => {
    const totalQueues = queues.length;
    const completedQueues = queues.filter(q => q.status === 'completed').length;
    const activeQueues = queues.filter(q => ['waiting', 'in-progress'].includes(q.status)).length;
    const cancelledQueues = queues.filter(q => q.status === 'cancelled').length;
    
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
      avgWaitTime: Math.round(avgWaitTime),
      completionRate: totalQueues > 0 ? Math.round((completedQueues / totalQueues) * 100) : 0,
      categoryBreakdown,
      facultyAvailability
    };
  };

  const analytics = calculateAnalytics();

  const getStatusColor = (status) => {
    const colors = {
      waiting: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
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
      dateRange,
      analytics,
      queues: queues.map(q => ({
        queueNumber: q.queueNumber,
        student: q.student?.name,
        category: q.concernCategory,
        status: q.status,
        checkInTime: q.checkInTime,
        faculty: q.faculty?.name || 'Unassigned'
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
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
              <p className="text-gray-600 mt-1">Monitor and evaluate system performance</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Admin Permissions</p>
                <p>✓ View faculty schedules | ✓ Monitor queue flow | ✓ Access reports</p>
                <p className="mt-1">✗ Cannot modify faculty availability | ✗ Cannot interfere with faculty queues</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['overview', 'queue-monitor', 'schedules', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                    activeTab === tab
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Queues</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalQueues}</p>
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
                    <p className="text-3xl font-bold text-blue-600">{analytics.activeQueues}</p>
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
                    <p className="text-3xl font-bold text-green-600">{analytics.completionRate}%</p>
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
                    <p className="text-3xl font-bold text-orange-600">{analytics.avgWaitTime}m</p>
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
                {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
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
                  <p className="text-3xl font-bold text-green-600">{analytics.facultyAvailability.available}</p>
                  <p className="text-sm text-gray-600 mt-1">Available</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-600">{analytics.facultyAvailability.busy}</p>
                  <p className="text-sm text-gray-600 mt-1">Busy</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-600">{analytics.facultyAvailability.offline}</p>
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

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Reports for Evaluation & Accreditation</h3>
              
              {/* Export Button */}
              <div className="mb-6">
                <button
                  onClick={exportReport}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Full Report (JSON)
                </button>
              </div>

              {/* Summary Statistics */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Queue Performance Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><strong>Total Queues Processed:</strong> {analytics.totalQueues}</p>
                    <p className="text-sm"><strong>Completed:</strong> {analytics.completedQueues} ({analytics.completionRate}%)</p>
                    <p className="text-sm"><strong>Cancelled:</strong> {analytics.cancelledQueues}</p>
                    <p className="text-sm"><strong>Currently Active:</strong> {analytics.activeQueues}</p>
                    <p className="text-sm"><strong>Average Wait Time:</strong> {analytics.avgWaitTime} minutes</p>
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
                    {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
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
      </div>
    </div>
  );
}

export default AdminPortal;
