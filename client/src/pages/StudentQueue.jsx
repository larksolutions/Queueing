import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { queueService } from '../services';
import { useNavigate } from 'react-router-dom';

const CONCERN_CATEGORIES = ['ID', 'OJT', 'Capstone', 'Staff/Admin', 'Enrollment', 'Other'];

function StudentQueue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    concernCategory: '',
    purpose: '',
    priority: 'normal'
  });
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await queueService.createQueue(formData);
      setQueueData(response.data);
      setFormData({ concernCategory: '', purpose: '', priority: 'normal' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join queue');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (queueData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="inline-block bg-green-100 rounded-full p-3 mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Queue #{queueData.queueNumber}</h2>
              <p className="text-gray-600">You've successfully joined the queue!</p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="text-lg font-semibold text-indigo-600">{queueData.concernCategory}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="text-lg font-semibold text-indigo-600">#{queueData.positionInQueue}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Wait</p>
                  <p className="text-lg font-semibold text-indigo-600">{queueData.estimatedWaitTime} mins</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-green-600 capitalize">{queueData.status}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">Your QR Code</p>
              <div className="inline-block bg-white p-4 rounded-lg border-2 border-gray-200">
                <img 
                  src={queueData.qrCode} 
                  alt="Queue QR Code" 
                  className="w-[200px] h-[200px]" 
                />
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> Please keep this page open and present your QR code when called.
              </p>
            </div>

            <button
              onClick={() => navigate('/queue/my-queue')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              View Queue Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Join Queue</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Concern Category *
              </label>
              <select
                name="concernCategory"
                value={formData.concernCategory}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a category</option>
                {CONCERN_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose of Visit *
              </label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Please describe your concern in detail..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
              <p className="mt-2 text-sm text-gray-600">
                <svg className="w-4 h-4 inline mr-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Urgent requests may be accommodated even if faculty are offline (manual/walk-in discretion)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining Queue...' : 'Join Queue'}
            </button>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Categories Explained:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li><strong>ID:</strong> Student ID concerns (new, replacement, validation)</li>
            <li><strong>OJT:</strong> On-the-Job Training related matters</li>
            <li><strong>Capstone:</strong> Thesis/Capstone project concerns</li>
            <li><strong>Staff/Admin:</strong> Administrative and staff-related inquiries</li>
            <li><strong>Enrollment:</strong> Registration and enrollment issues</li>
            <li><strong>Other:</strong> General inquiries</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StudentQueue;
