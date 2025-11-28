import { useState, useEffect } from 'react';
import { queueService } from '../services';

function QueueManagement() {
  const [queues, setQueues] = useState([]);
  const [stats, setStats] = useState([]);
  const [filter, setFilter] = useState({ status: '', concernCategory: '' });
  const [loading, setLoading] = useState(true);

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
      waiting: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Queue Management</h1>
              <p className="text-gray-600">Monitor and manage student queues by category</p>
            </div>
            {/* Real-time indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span>Auto-refresh every 5s</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{stat._id}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(stat._id)}`}>
                  {stat.total} Total
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Waiting</p>
                  <p className="text-2xl font-bold text-yellow-600">{stat.waiting}</p>
                </div>
                <div>
                  <p className="text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stat.inProgress}</p>
                </div>
                <div>
                  <p className="text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stat.completed}</p>
                </div>
                <div>
                  <p className="text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stat.cancelled}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="waiting">Waiting</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={filter.concernCategory}
                onChange={(e) => setFilter({ ...filter, concernCategory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                <option value="ID">ID</option>
                <option value="OJT">OJT</option>
                <option value="Capstone">Capstone</option>
                <option value="Staff/Admin">Staff/Admin</option>
                <option value="Enrollment">Enrollment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Queue List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Queue Entries ({queues.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : queues.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No queue entries found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Queue #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queues.map((queue) => (
                    <tr key={queue._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-indigo-600">#{queue.queueNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{queue.student?.name}</p>
                          <p className="text-sm text-gray-500">{queue.student?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(queue.concernCategory)}`}>
                          {queue.concernCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 max-w-xs truncate">{queue.purpose}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(queue.status)}`}>
                          {queue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{queue.positionInQueue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {queue.status === 'waiting' && (
                          <button
                            onClick={() => handleStatusUpdate(queue._id, 'in-progress')}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                          >
                            Start
                          </button>
                        )}
                        {queue.status === 'in-progress' && (
                          <button
                            onClick={() => handleStatusUpdate(queue._id, 'completed')}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QueueManagement;
