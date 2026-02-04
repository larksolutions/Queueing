import { useState, useEffect, useRef } from 'react';
import { scheduleService } from '../services';
import { useAuth } from '../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function FacultyScheduleManager() {
  const { user } = useAuth();
  const calendarRef = useRef(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBookedStudentsModal, setShowBookedStudentsModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'available',
    location: user?.officeLocation || '',
    color: '#3B82F6',
    isPublic: true,
    maxStudents: '',
  });

  const scheduleTypes = [
    { value: 'available', label: 'Available', color: '#10B981' },
    { value: 'consultation', label: 'Consultation Hours', color: '#3B82F6' },
    { value: 'office-hours', label: 'Office Hours', color: '#6366F1' },
    { value: 'class', label: 'Class', color: '#F59E0B' },
    { value: 'meeting', label: 'Meeting', color: '#EF4444' },
    { value: 'busy', label: 'Busy', color: '#DC2626' },
    { value: 'break', label: 'Break/Lunch', color: '#6B7280' },
  ];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // Fetch schedules for the entire year
      const startDate = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = new Date(new Date().getFullYear(), 11, 31).toISOString();
      
      const data = await scheduleService.getFacultySchedules(user._id, startDate, endDate);
      setSchedules(data);
    } catch (err) {
      setError('Failed to fetch schedules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Convert schedules to FullCalendar events format
  const calendarEvents = schedules.map(schedule => ({
    id: schedule._id,
    title: schedule.title,
    start: schedule.startTime,
    end: schedule.endTime,
    backgroundColor: schedule.color || getTypeColor(schedule.type),
    borderColor: schedule.color || getTypeColor(schedule.type),
    extendedProps: {
      description: schedule.description,
      type: schedule.type,
      location: schedule.location,
      isPublic: schedule.isPublic,
      maxStudents: schedule.maxStudents,
      bookedStudents: schedule.bookedStudents,
      scheduleData: schedule
    }
  }));

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    const startTime = new Date(arg.date);
    const endTime = new Date(arg.date);
    endTime.setHours(endTime.getHours() + 1);
    
    setFormData({
      ...formData,
      startTime: startTime.toISOString().slice(0, 16),
      endTime: endTime.toISOString().slice(0, 16),
    });
    setShowModal(true);
  };

  const handleEventClick = (clickInfo) => {
    const schedule = clickInfo.event.extendedProps.scheduleData;
    setSelectedSchedule(schedule);
    
    // If schedule has booked students, show the booked students modal
    if (schedule.bookedStudents && schedule.bookedStudents.length > 0) {
      setShowBookedStudentsModal(true);
    } else {
      // Otherwise, open the edit modal
      handleEdit(schedule);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingSchedule) {
        await scheduleService.updateSchedule(editingSchedule._id, formData);
        setSuccess('Schedule updated successfully!');
      } else {
        await scheduleService.createSchedule(formData);
        setSuccess('Schedule created successfully!');
      }
      
      setShowModal(false);
      resetForm();
      fetchSchedules();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await scheduleService.deleteSchedule(scheduleId);
      setSuccess('Schedule deleted successfully!');
      fetchSchedules();
    } catch (err) {
      setError('Failed to delete schedule');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description || '',
      startTime: new Date(schedule.startTime).toISOString().slice(0, 16),
      endTime: new Date(schedule.endTime).toISOString().slice(0, 16),
      type: schedule.type,
      location: schedule.location || '',
      color: schedule.color,
      isPublic: schedule.isPublic,
      maxStudents: schedule.maxStudents || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      type: 'available',
      location: user?.officeLocation || '',
      color: '#3B82F6',
      isPublic: true,
      maxStudents: '',
    });
    setEditingSchedule(null);
    setSelectedDate(null);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeColor = (type) => {
    const typeConfig = scheduleTypes.find(t => t.value === type);
    return typeConfig?.color || '#3B82F6';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule Management</h2>
          <p className="text-gray-600">Manage your availability and calendar</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
        >
          + Add Schedule
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
          {success}
        </div>
      )}

      {/* FullCalendar */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            height="auto"
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            eventContent={(eventInfo) => (
              <div className="p-1 overflow-hidden">
                <div className="font-semibold text-xs truncate">{eventInfo.event.title}</div>
                <div className="text-xs truncate">{eventInfo.timeText}</div>
                {eventInfo.event.extendedProps.maxStudents && (
                  <div className="text-xs">
                    👥 {eventInfo.event.extendedProps.bookedStudents?.length || 0}/{eventInfo.event.extendedProps.maxStudents}
                  </div>
                )}
              </div>
            )}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
              onClick={() => setShowModal(false)}
            ></div>

            <div className="relative inline-block w-full max-w-2xl p-6 my-8 text-left bg-white rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Consultation Hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {scheduleTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add any additional details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Office location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Students (Optional - for bookable slots)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                    Make this schedule visible to students
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                  >
                    {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Booked Students Modal */}
      {showBookedStudentsModal && selectedSchedule && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
              onClick={() => setShowBookedStudentsModal(false)}
            ></div>

            <div className="relative inline-block w-full max-w-3xl p-6 my-8 text-left bg-white rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedSchedule.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(selectedSchedule.startTime)} • {formatTime(selectedSchedule.startTime)} - {formatTime(selectedSchedule.endTime)}
                  </p>
                </div>
                <button
                  onClick={() => setShowBookedStudentsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Schedule Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-semibold capitalize">{selectedSchedule.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-semibold">{selectedSchedule.location || 'N/A'}</span>
                  </div>
                  {selectedSchedule.maxStudents && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="ml-2 font-semibold">
                        {selectedSchedule.bookedStudents?.length || 0} / {selectedSchedule.maxStudents} students
                      </span>
                    </div>
                  )}
                </div>
                {selectedSchedule.description && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700">{selectedSchedule.description}</p>
                  </div>
                )}
              </div>

              {/* Booked Students List */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Booked Students ({selectedSchedule.bookedStudents?.length || 0})
                </h4>
                
                {selectedSchedule.bookedStudents && selectedSchedule.bookedStudents.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedSchedule.bookedStudents.map((student, index) => (
                      <div
                        key={student._id || index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                            {student.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                            {student.studentId && (
                              <p className="text-xs text-gray-500">ID: {student.studentId}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            ✓ Booked
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-600">No students have booked this schedule yet</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowBookedStudentsModal(false);
                    handleEdit(selectedSchedule);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition"
                >
                  ✏️ Edit Schedule
                </button>
                <button
                  onClick={() => setShowBookedStudentsModal(false)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyScheduleManager;
