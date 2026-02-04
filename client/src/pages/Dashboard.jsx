import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { queueService } from '../services';
import FacultyAvailability from '../components/FacultyAvailability';
import FacultyStatusToggle from '../components/FacultyStatusToggle';
import FacultyScheduleManager from '../components/FacultyScheduleManager';
import StudentScheduleView from '../components/StudentScheduleView';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myQueue, setMyQueue] = useState(null);
  const [queueHistory, setQueueHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, schedules
  const [cancelling, setCancelling] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Redirect admin users to admin portal
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/portal');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchMyCurrentQueue();
      fetchQueueHistory();
      
      // Set up real-time polling for queue status (every 5 seconds)
      const queueInterval = setInterval(() => {
        fetchMyCurrentQueue();
      }, 5000);
      
      const historyInterval = setInterval(() => {
        fetchQueueHistory();
      }, 10000);
      
      return () => {
        clearInterval(queueInterval);
        clearInterval(historyInterval);
      };
    } else {
      setLoading(false);
      setHistoryLoading(false);
    }
  }, [user]);

  const fetchMyCurrentQueue = async () => {
    try {
      const response = await queueService.getAllQueues();
      // Find the current user's active queue (waiting or in-progress)
      const currentQueue = response.data.find(
        q => q.student._id === user._id && (q.status === 'waiting' || q.status === 'in-progress')
      );
      setMyQueue(currentQueue);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueHistory = async () => {
    try {
      const response = await queueService.getAllQueues();
      // Get completed and cancelled queues for the student
      const history = response.data.filter(
        q => q.student._id === user._id && (q.status === 'completed' || q.status === 'cancelled')
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5); // Last 5 entries
      setQueueHistory(history);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      waiting: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelQueue = async () => {
    if (!window.confirm('Are you sure you want to cancel your queue entry?')) {
      return;
    }

    setCancelling(true);
    try {
      await queueService.updateQueue(myQueue._id, { status: 'cancelled' });
      setMyQueue(null); // Clear the active queue
      fetchQueueHistory(); // Refresh history to show cancelled queue
    } catch (error) {
      console.error('Error cancelling queue:', error);
      alert('Failed to cancel queue. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      {/* Modern Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="CICS Logo" className="h-14 w-14 object-contain" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  CICS Queueing System
                </h1>
                <p className="text-xs text-gray-500">IT Department Office</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800">
                  {user?.role === 'student' ? '👨‍🎓 Student' : user?.role === 'faculty' ? '👨‍🏫 Faculty' : '👤 Admin'}
                </span>
              </div>
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition duration-200 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-600">
                {user?.role === 'student' 
                  ? 'Track your queue status and view faculty availability' 
                  : 'Manage queues and update your availability status'}
              </p>
            </div>
            {/* Real-time indicator for students */}
            {user?.role === 'student' && (
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-green-200">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="font-medium">Live Updates</span>
              </div>
            )}
          </div>
        </div>

        {/* Faculty Status Toggle for Faculty only (not admin) */}
        {user?.role === 'faculty' && (
          <FacultyStatusToggle />
        )}

        {/* Tab Navigation */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Overview
              </span>
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'schedules'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {user?.role === 'faculty' ? 'My Schedule' : 'Faculty Schedules'}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'schedules' ? (
          user?.role === 'faculty' || user?.role === 'admin' ? (
            <FacultyScheduleManager />
          ) : (
            <StudentScheduleView />
          )
        ) : (
          <>
            {/* Original Dashboard Content */}

        {/* Student's Current Queue Status */}
        {user?.role === 'student' && !loading && myQueue && (
          <div className={`mb-8 rounded-2xl shadow-xl overflow-hidden border-2 ${
            myQueue.status === 'in-progress' 
              ? 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 border-cyan-300 animate-pulse' 
              : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 border-purple-300'
          }`}>
            <div className="p-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {myQueue.status === 'in-progress' ? (
                      <span className="text-4xl animate-bounce">🔔</span>
                    ) : (
                      <span className="text-4xl">⏳</span>
                    )}
                    <h3 className="text-3xl font-bold">
                      {myQueue.status === 'in-progress' ? 'You Are Being Served!' : 'Your Active Queue'}
                    </h3>
                  </div>
                  <p className="text-white/90 text-sm">
                    {myQueue.status === 'in-progress' 
                      ? 'Please proceed to the office counter' 
                      : 'Please wait for your turn'}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                  <span className="text-white/90 text-xs font-medium block mb-1">Status</span>
                  <span className="text-white font-bold text-lg capitalize">
                    {myQueue.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Queue Number */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-white/80 text-sm mb-1">Queue Number</p>
                  <p className="text-4xl font-bold">{myQueue.queueNumber}</p>
                </div>

                {/* Category */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-white/80 text-sm mb-1">Category</p>
                  <p className="text-xl font-semibold">{myQueue.concernCategory}</p>
                </div>

                {/* QR Code */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex flex-col items-center justify-center">
                  <p className="text-white/80 text-sm mb-2">Your QR Code</p>
                  <div 
                    className="bg-white p-2 rounded-lg cursor-pointer hover:scale-110 hover:shadow-2xl transition-all duration-200 relative group"
                    onClick={() => setShowQRModal(true)}
                  >
                    <img src={myQueue.qrCode} alt="Queue QR Code" className="w-20 h-20" />
                  </div>
                  <p className="text-white/60 text-xs mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Click to enlarge
                  </p>
                </div>
              </div>

              {myQueue.status === 'in-progress' && (
                <div className="mt-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-white font-medium">
                      Your turn! Please proceed to the office counter now.
                    </p>
                  </div>
                </div>
              )}

              {/* Cancel Queue Button */}
              {myQueue.status === 'waiting' && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCancelQueue}
                    disabled={cancelling}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl font-semibold transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {cancelling ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Queue
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Active Queue Message for Students */}
        {user?.role === 'student' && !loading && !myQueue && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-8 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">No Active Queue</h3>
                  <p className="text-gray-600">You're not currently in any queue. Join a queue to get started.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/queue/join')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Join Queue Now
              </button>
            </div>
          </div>
        )}

        {/* Queue History for Students */}
        {user?.role === 'student' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Queue History</h2>
                <p className="text-sm text-gray-500">Your recent queue transactions</p>
              </div>
              <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">Last 5 entries</span>
            </div>
            
            {historyLoading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading history...</p>
              </div>
            ) : queueHistory.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Queue #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {queueHistory.map((queue) => (
                        <tr key={queue._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {queue.queueNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{queue.concernCategory}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(queue.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(queue.status)}`}>
                              {queue.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No queue history found</p>
                <p className="text-sm text-gray-400 mt-1">Your completed and cancelled queues will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Faculty Availability Section */}
        <div className="mb-8">
          <FacultyAvailability />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(user?.role === 'student' || user?.role === 'admin') && (
              <button
                onClick={() => navigate('/queue/join')}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 text-left border-2 border-transparent hover:border-indigo-200 transform hover:-translate-y-1 group"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 mr-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition">Join Queue</h3>
                    <p className="text-gray-500 text-sm">Get your queue number</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Select your concern category and join the queue for assistance
                </p>
              </button>
            )}

            {(user?.role === 'faculty' || user?.role === 'admin') && (
              <button
                onClick={() => navigate('/queue/manage')}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 text-left border-2 border-transparent hover:border-green-200 transform hover:-translate-y-1 group"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 mr-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition">Manage Queue</h3>
                    <p className="text-gray-500 text-sm">View and process students</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Monitor queues by category and manage student concerns
                </p>
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/portal')}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 text-left border-2 border-transparent hover:border-blue-200 transform hover:-translate-y-1 group"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 mr-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">Admin Portal</h3>
                    <p className="text-gray-500 text-sm">Reports & Analytics</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Access system reports and evaluation metrics
                </p>
              </button>
            )}

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Service Categories</h3>
                  <p className="text-white/80 text-sm">Available assistance</p>
                </div>
              </div>
              <ul className="text-sm space-y-2.5 text-white/90">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  ID Concerns
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  OJT Matters
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  Capstone Projects
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  Staff/Admin
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  Enrollment
                </li>
              </ul>
            </div>
          </div>
        </div>
          </>
        )}
        {/* QR Code Enlarge Modal */}
        {showQRModal && myQueue && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowQRModal(false)}
          >
            <div 
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Queue QR Code</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <div className="bg-white p-4 rounded-lg shadow-inner flex justify-center">
                  <img src={myQueue.qrCode} alt="Queue QR Code" className="w-64 h-64" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl mb-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Queue Number</p>
                    <p className="text-2xl font-bold text-indigo-600">{myQueue.queueNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Category</p>
                    <p className="text-lg font-semibold text-purple-600">{myQueue.concernCategory}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = myQueue.qrCode;
                    link.download = `queue-${myQueue.queueNumber}-qr.png`;
                    link.click();
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}      </main>
    </div>
  );
}

export default Dashboard;
