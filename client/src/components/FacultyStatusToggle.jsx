import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { facultyService } from '../services';

function FacultyStatusToggle() {
  const { user } = useAuth();
  const [status, setStatus] = useState('offline');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user?.availabilityStatus) {
      setStatus(user.availabilityStatus);
    }
  }, [user]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await facultyService.updateStatus({ 
        availabilityStatus: newStatus,
        isAvailable: newStatus === 'available' 
      });
      setStatus(newStatus);
      // Show success notification
      alert(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions = [
    { value: 'available', label: 'Available', color: 'bg-green-500', hoverColor: 'hover:bg-green-600', icon: '✓' },
    { value: 'busy', label: 'Busy', color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-600', icon: '◐' },
    { value: 'offline', label: 'Offline', color: 'bg-gray-500', hoverColor: 'hover:bg-gray-600', icon: '○' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">My Availability Status</h3>
      
      <div className="flex flex-wrap gap-3">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={updating || status === option.value}
            className={`
              flex items-center px-4 py-2 rounded-lg text-white font-medium transition duration-200
              ${status === option.value ? option.color : 'bg-gray-300'}
              ${status !== option.value && !updating ? option.hoverColor : ''}
              ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${status === option.value ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}
            `}
          >
            <span className="mr-2 text-lg">{option.icon}</span>
            {option.label}
            {status === option.value && (
              <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Status Guide:</p>
            <ul className="space-y-1">
              <li><strong>Available:</strong> Ready to assist students</li>
              <li><strong>Busy:</strong> Currently occupied but in office</li>
              <li><strong>Offline:</strong> Not actively monitoring queue (urgent concerns may still be accommodated via walk-in)</li>
            </ul>
          </div>
        </div>
      </div>

      {updating && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          Updating status...
        </div>
      )}
    </div>
  );
}

export default FacultyStatusToggle;
