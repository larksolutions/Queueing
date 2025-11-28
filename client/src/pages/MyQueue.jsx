import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { queueService } from '../services';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

function MyQueue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchMyQueue();
    const interval = setInterval(fetchMyQueue, 5000); // Refresh every 5 seconds for real-time updates
    return () => clearInterval(interval);
  }, []);

  const fetchMyQueue = async () => {
    try {
      const response = await queueService.getAllQueues();
      const myActiveQueue = response.data.find(
        q => q.student._id === user._id && (q.status === 'waiting' || q.status === 'in-progress')
      );
      
      if (myActiveQueue) {
        // Get real-time position
        const positionResponse = await queueService.getMyPosition(myActiveQueue._id);
        setQueue(positionResponse.data);
      } else {
        setQueue(null);
      }
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your queue entry?')) {
      return;
    }

    setCancelling(true);
    try {
      await queueService.updateQueue(queue.queue._id, { status: 'cancelled' });
      setQueue(null);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to cancel queue');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      waiting: { color: 'bg-yellow-500', text: 'Waiting', icon: '⏳' },
      'in-progress': { color: 'bg-blue-500', text: 'In Progress', icon: '🔄' }
    };
    const badge = badges[status] || badges.waiting;
    
    return (
      <div className={`${badge.color} text-white px-6 py-3 rounded-lg inline-flex items-center gap-2`}>
        <span className="text-2xl">{badge.icon}</span>
        <span className="text-xl font-bold">{badge.text}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your queue...</p>
        </div>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="inline-block bg-gray-100 rounded-full p-4 mb-4">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Active Queue</h2>
              <p className="text-gray-600 mb-6">You are not currently in any queue</p>
              <button
                onClick={() => navigate('/queue/join')}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
              >
                Join Queue Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { queue: queueData, currentPosition, estimatedWaitTime } = queue;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          {/* Real-time indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span>Live updates every 5s</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Main Queue Card */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-6">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 text-center">
            <h1 className="text-4xl font-bold mb-2">Queue #{queueData.queueNumber}</h1>
            {getStatusBadge(queueData.status)}
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Queue Information</h2>
                
                <div className="space-y-4">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="text-2xl font-bold text-indigo-600">{queueData.concernCategory}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Your Position</p>
                      <p className="text-3xl font-bold text-green-600">#{currentPosition}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Est. Wait Time</p>
                      <p className="text-3xl font-bold text-orange-600">{estimatedWaitTime}m</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Purpose of Visit</p>
                    <p className="text-gray-900">{queueData.purpose}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Priority</p>
                    <p className="text-gray-900 capitalize font-semibold">{queueData.priority}</p>
                  </div>

                  {queueData.notes && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 mb-2">Notes from Staff</p>
                      <p className="text-gray-900">{queueData.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - QR Code */}
              <div className="flex flex-col items-center justify-start">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your QR Code</h2>
                <div className="bg-white border-4 border-indigo-600 rounded-lg p-6 shadow-lg">
                  <QRCodeSVG 
                    value={JSON.stringify({
                      queueId: queueData._id,
                      queueNumber: queueData.queueNumber,
                      studentId: queueData.student._id,
                      category: queueData.concernCategory,
                      timestamp: Date.now()
                    })} 
                    size={250}
                    level="H"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Please present this QR code when called
                  </p>
                  <p className="text-xs text-gray-500">
                    Auto-refreshing every 10 seconds
                  </p>
                </div>
              </div>
            </div>

            {/* Alert Messages */}
            {queueData.status === 'waiting' && currentPosition <= 3 && (
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-yellow-700 font-semibold">
                    You're almost there! Please stay nearby, you'll be called soon.
                  </p>
                </div>
              </div>
            )}

            {queueData.status === 'in-progress' && (
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-400 mr-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-blue-700 font-semibold">
                    You are currently being served. Please proceed to the counter.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {queueData.status === 'waiting' && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Queue'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Keep this page open to see real-time updates on your position</li>
            <li>• Please stay in the waiting area when your position is in the top 5</li>
            <li>• Have your QR code ready to scan when called</li>
            <li>• Bring any required documents for your concern</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MyQueue;
