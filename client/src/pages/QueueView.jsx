import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { queueService } from '../services';

function QueueView() {
  const { queueNumber } = useParams();
  const navigate = useNavigate();
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQueueDetails();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchQueueDetails, 5000);
    return () => clearInterval(interval);
  }, [queueNumber]);

  const fetchQueueDetails = async () => {
    try {
      const response = await queueService.getAllQueues();
      // Convert queueNumber from URL param (string) to number for comparison
      const queueData = response.data.find(q => q.queueNumber == queueNumber);
      
      if (queueData) {
        setQueue(queueData);
        setError('');
      } else {
        setError('Queue not found');
      }
    } catch (err) {
      console.error('Error fetching queue:', err);
      setError('Failed to load queue details');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading queue details...</p>
        </div>
      </div>
    );
  }

  if (error || !queue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-block bg-red-100 rounded-full p-4 mb-4">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Queue Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The queue you\'re looking for doesn\'t exist or has been removed.'}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="CICS Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Queue Details</h1>
          <p className="text-gray-600">CICS Queueing System</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-4xl">{getStatusIcon(queue.status)}</span>
              <h2 className="text-4xl font-bold">Queue #{queue.queueNumber}</h2>
            </div>
            <div className={`inline-block px-6 py-2 rounded-full text-lg font-semibold ${getStatusColor(queue.status)} border-2`}>
              {queue.status.toUpperCase()}
            </div>
          </div>

          {/* Queue Information */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Student Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-gray-900 font-semibold">{queue.student?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{queue.student?.email || 'N/A'}</p>
                  </div>
                  {queue.student?.studentId && (
                    <div>
                      <p className="text-sm text-gray-600">Student ID</p>
                      <p className="text-gray-900 font-mono">{queue.student.studentId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Queue Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Queue Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="text-gray-900 font-semibold">{queue.concernCategory}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <p className="text-gray-900 capitalize">{queue.priority || 'Normal'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-in Time</p>
                    <p className="text-gray-900">{new Date(queue.checkInTime).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="md:col-span-2 bg-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Purpose of Visit
                </h3>
                <p className="text-gray-900">{queue.purpose}</p>
              </div>

              {/* Faculty & Time Info */}
              {queue.faculty && (
                <div className="md:col-span-2 bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Assigned Faculty
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Faculty Name</p>
                      <p className="text-gray-900 font-semibold">{queue.faculty.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900">{queue.faculty.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              {(queue.startTime || queue.completedTime) && (
                <div className="md:col-span-2 bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {queue.startTime && (
                      <div>
                        <p className="text-sm text-gray-600">Started</p>
                        <p className="text-gray-900">{new Date(queue.startTime).toLocaleString()}</p>
                      </div>
                    )}
                    {queue.completedTime && (
                      <div>
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="text-gray-900">{new Date(queue.completedTime).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes/Remarks */}
              {queue.remarks && (
                <div className="md:col-span-2 bg-yellow-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Staff Remarks
                  </h3>
                  <p className="text-gray-900">{queue.remarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-3">
              <span className="relative flex h-3 w-3 inline-flex mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Auto-refreshing every 5 seconds
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueueView;
