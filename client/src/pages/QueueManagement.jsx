import { useState, useEffect } from 'react';
import { queueService } from '../services';
import { useAuth } from '../context/AuthContext';

function QueueManagement() {
  const { user } = useAuth();
  const [queues, setQueues] = useState([]);
  const [stats, setStats] = useState([]);
  const [filter, setFilter] = useState({ status: '', concernCategory: '' });
  const [loading, setLoading] = useState(true);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchQueues();
    fetchStats();
    
    // Set up real-time polling (every 5 seconds)
    const interval = setInterval(() => {
      fetchQueues();
      fetchStats();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [filter]);

  const fetchQueues = async () => {
    try {
      const response = await queueService.getAllQueues(filter.status, filter.concernCategory);
      setQueues(response.data);
    } catch (error) {
      console.error('Error fetching queues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await queueService.getQueueStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await queueService.updateQueue(id, { status: newStatus });
      fetchQueues();
      fetchStats();
    } catch (error) {
      console.error('Error updating queue:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      waiting: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      rescheduled: 'bg-orange-100 text-orange-800 border-orange-200',
      declined: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      waiting: '⏳',
      'in-progress': '🔄',
      completed: '✅',
      cancelled: '❌',
      rescheduled: '📅',
      declined: '🚫'
    };
    return icons[status] || '📋';
  };

  const getCategoryColor = (category) => {
    const colors = {
      ID: 'bg-purple-100 text-purple-800 border-purple-200',
      OJT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      Capstone: 'bg-blue-100 text-blue-800 border-blue-200',
      'Staff/Admin': 'bg-green-100 text-green-800 border-green-200',
      Enrollment: 'bg-orange-100 text-orange-800 border-orange-200',
      Other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      ID: '🆔',
      OJT: '💼',
      Capstone: '🎓',
      'Staff/Admin': '👨‍💼',
      Enrollment: '📝',
      Other: '📋'
    };
    return icons[category] || '📋';
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateWaitTime = (checkInTime, completedTime, status) => {
    if (!checkInTime) return 'N/A';
    
    // For completed, cancelled, rescheduled, or declined queues, use completedTime
    // Otherwise, use current time for active queues
    const endTime = (status === 'completed' || status === 'cancelled' || status === 'rescheduled' || status === 'declined') && completedTime
      ? new Date(completedTime)
      : Date.now();
    
    const wait = Math.floor((endTime - new Date(checkInTime)) / 60000);
    return wait < 60 ? `${wait}m` : `${Math.floor(wait / 60)}h ${wait % 60}m`;
  };

  const viewQueueDetails = (queue) => {
    setSelectedQueue(queue);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src="/logo.png" alt="CICS Logo" className="h-14 w-14 object-contain" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Queue Management</h1>
                  <p className="text-gray-600">Monitor and manage student queues efficiently</p>
                </div>
              </div>
            </div>
            
            {/* Real-time indicator & Info */}
            <div className="flex items-center gap-3">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <div>
                    <p className="text-xs text-gray-500">Live Updates</p>
                    <p className="text-sm font-medium text-gray-900">Every 5 seconds</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs text-indigo-600">Logged in as</p>
                    <p className="text-sm font-medium text-indigo-900">{user?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(stat._id)}</span>
                    <h3 className="text-lg font-bold text-white">{stat._id}</h3>
                  </div>
                  <span className="bg-white bg-opacity-20 text-black px-3 py-1 rounded-full text-sm font-semibold">
                    {stat.total} Total
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">⏳</span>
                      <p className="text-xs text-gray-600 font-medium">Waiting</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{stat.waiting}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🔄</span>
                      <p className="text-xs text-gray-600 font-medium">In Progress</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stat.inProgress}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">✅</span>
                      <p className="text-xs text-gray-600 font-medium">Completed</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stat.completed}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">❌</span>
                      <p className="text-xs text-gray-600 font-medium">Cancelled</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{stat.cancelled}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Filter Queues</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status
                </span>
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
              >
                <option value="">All Statuses</option>
                <option value="waiting">⏳ Waiting</option>
                <option value="in-progress">🔄 In Progress</option>
                <option value="completed">✅ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
                <option value="rescheduled">📅 Rescheduled</option>
                <option value="declined">🚫 Declined</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Category
                </span>
              </label>
              <select
                value={filter.concernCategory}
                onChange={(e) => setFilter({ ...filter, concernCategory: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
              >
                <option value="">All Categories</option>
                <option value="ID">🆔 ID</option>
                <option value="OJT">💼 OJT</option>
                <option value="Capstone">🎓 Capstone</option>
                <option value="Staff/Admin">👨‍💼 Staff/Admin</option>
                <option value="Enrollment">📝 Enrollment</option>
                <option value="Other">📋 Other</option>
              </select>
            </div>
          </div>
          {(filter.status || filter.concernCategory) && (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setFilter({ status: '', concernCategory: '' })}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Queue List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <h2 className="text-xl font-bold text-white">
                  Active Queue Entries
                </h2>
              </div>
              <span className="bg-white bg-opacity-20 text-black px-4 py-2 rounded-lg text-sm font-semibold">
                {queues.length} {queues.length === 1 ? 'Entry' : 'Entries'}
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
                <p className="text-gray-600 font-medium">Loading queues...</p>
              </div>
            </div>
          ) : queues.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-gray-100 rounded-full p-6">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No Queue Entries Found</h3>
                  <p className="text-gray-600">There are no queues matching your current filters.</p>
                </div>
                {(filter.status || filter.concernCategory) && (
                  <button
                    onClick={() => setFilter({ status: '', concernCategory: '' })}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Queue #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Student Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Wait Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queues.map((queue, index) => (
                    <tr key={queue._id} className={`hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="bg-indigo-100 rounded-full p-2">
                            <span className="text-xl font-bold text-indigo-600">#{queue.queueNumber}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <div>Pos: #{queue.positionInQueue}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                            {queue.student?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{queue.student?.name}</p>
                            <p className="text-sm text-gray-500">{queue.student?.email}</p>
                            <p className="text-xs text-gray-400">ID: {queue.student?.studentId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold border ${getCategoryColor(queue.concernCategory)}`}>
                          <span>{getCategoryIcon(queue.concernCategory)}</span>
                          {queue.concernCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-900 line-clamp-2">{queue.purpose}</p>
                          <button
                            onClick={() => viewQueueDetails(queue)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-1"
                          >
                            View details →
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold border ${getStatusColor(queue.status)}`}>
                          <span>{getStatusIcon(queue.status)}</span>
                          {queue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-900 font-medium">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {calculateWaitTime(queue.checkInTime, queue.completedTime, queue.status)}
                          </div>
                          <p className="text-xs text-gray-500">Since {formatTime(queue.checkInTime)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {queue.status === 'waiting' && (
                            <button
                              onClick={() => handleStatusUpdate(queue._id, 'in-progress')}
                              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Start
                            </button>
                          )}
                          {queue.status === 'in-progress' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(queue._id, 'completed')}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-md hover:shadow-lg font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Complete
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(queue._id, 'rescheduled')}
                                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition shadow-md hover:shadow-lg font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(queue._id, 'declined')}
                                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition shadow-md hover:shadow-lg font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Decline
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => viewQueueDetails(queue)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Queue Details Modal */}
      {showDetailsModal && selectedQueue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Queue Details #{selectedQueue.queueNumber}</h3>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Student Information */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Student Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{selectedQueue.student?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Student ID</p>
                    <p className="font-semibold text-gray-900">{selectedQueue.student?.studentId || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{selectedQueue.student?.email}</p>
                  </div>
                </div>
              </div>

              {/* Queue Information */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Queue Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getCategoryColor(selectedQueue.concernCategory)}`}>
                      {getCategoryIcon(selectedQueue.concernCategory)} {selectedQueue.concernCategory}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(selectedQueue.status)}`}>
                      {getStatusIcon(selectedQueue.status)} {selectedQueue.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Position</span>
                    <span className="font-semibold text-gray-900">#{selectedQueue.positionInQueue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Priority</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedQueue.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {selectedQueue.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">Purpose</h4>
                <p className="text-gray-900">{selectedQueue.purpose}</p>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timeline
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Check-in</span>
                    <span className="font-medium text-gray-900">{formatDate(selectedQueue.checkInTime)} at {formatTime(selectedQueue.checkInTime)}</span>
                  </div>
                  {selectedQueue.startTime && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Started</span>
                      <span className="font-medium text-gray-900">{formatDate(selectedQueue.startTime)} at {formatTime(selectedQueue.startTime)}</span>
                    </div>
                  )}
                  {selectedQueue.completedTime && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-medium text-gray-900">{formatDate(selectedQueue.completedTime)} at {formatTime(selectedQueue.completedTime)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-300">
                    <span className="text-gray-600 font-semibold">Total Wait Time</span>
                    <span className="font-bold text-indigo-600">{calculateWaitTime(selectedQueue.checkInTime, selectedQueue.completedTime, selectedQueue.status)}</span>
                  </div>
                </div>
              </div>

              {/* Remarks if any */}
              {selectedQueue.remarks && (
                <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                  <h4 className="text-sm font-bold text-yellow-800 uppercase mb-2">Remarks</h4>
                  <p className="text-yellow-900">{selectedQueue.remarks}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QueueManagement;
