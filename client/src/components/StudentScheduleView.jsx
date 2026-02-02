import { useState, useEffect, useRef } from 'react';
import { scheduleService, facultyService } from '../services';
import { useAuth } from '../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function StudentScheduleView() {
  const { user } = useAuth();
  const calendarRef = useRef(null);
  const [schedules, setSchedules] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myBookings, setMyBookings] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const scheduleTypes = {
    'available': { label: 'Available', color: '#10B981' },
    'consultation': { label: 'Consultation', color: '#3B82F6' },
    'office-hours': { label: 'Office Hours', color: '#6366F1' },
    'class': { label: 'Class', color: '#F59E0B' },
    'meeting': { label: 'Meeting', color: '#EF4444' },
    'busy': { label: 'Busy', color: '#DC2626' },
    'break': { label: 'Break', color: '#6B7280' },
  };

  useEffect(() => {
    fetchFaculty();
    fetchMyBookings();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [selectedFaculty]);

  const fetchFaculty = async () => {
    try {
      const response = await facultyService.getAllFaculty();
      setFaculty(response.data || []);
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
      setFaculty([]);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const startDate = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = new Date(new Date().getFullYear(), 11, 31).toISOString();
      
      const data = await scheduleService.getPublicSchedules(
        startDate, 
        endDate, 
        selectedFaculty || null
      );
      setSchedules(data);
    } catch (err) {
      setError('Failed to fetch schedules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const data = await scheduleService.getMyBookedSchedules();
      setMyBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const handleBook = async (scheduleId) => {
    try {
      setError('');
      setSuccess('');
      await scheduleService.bookSchedule(scheduleId);
      setSuccess('Schedule booked successfully!');
      fetchSchedules();
      fetchMyBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book schedule');
    }
  };

  const handleCancelBooking = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setError('');
      setSuccess('');
      await scheduleService.cancelBooking(scheduleId);
      setSuccess('Booking cancelled successfully!');
      fetchSchedules();
      fetchMyBookings();
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  // Convert schedules to FullCalendar events format
  const calendarEvents = schedules.map(schedule => {
    const isBooked = myBookings.some(booking => booking._id === schedule._id);
    return {
      id: schedule._id,
      title: `${schedule.title} - ${schedule.faculty?.name}`,
      start: schedule.startTime,
      end: schedule.endTime,
      backgroundColor: isBooked ? '#10B981' : scheduleTypes[schedule.type]?.color,
      borderColor: isBooked ? '#10B981' : scheduleTypes[schedule.type]?.color,
      extendedProps: {
        description: schedule.description,
        type: schedule.type,
        location: schedule.location,
        faculty: schedule.faculty,
        maxStudents: schedule.maxStudents,
        bookedStudents: schedule.bookedStudents,
        scheduleData: schedule,
        isBooked: isBooked
      }
    };
  });

  const handleEventClick = (clickInfo) => {
    const schedule = clickInfo.event.extendedProps.scheduleData;
    setSelectedEvent(schedule);
    setShowDetailsModal(true);
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

  const isBooked = (scheduleId) => {
    return myBookings.some(booking => booking._id === scheduleId);
  };

  const canBook = (schedule) => {
    if (!schedule.isPublic) return false;
    if (!['available', 'consultation', 'office-hours'].includes(schedule.type)) return false;
    if (schedule.maxStudents && schedule.bookedStudents?.length >= schedule.maxStudents) return false;
    if (isBooked(schedule._id)) return false;
    return new Date(schedule.startTime) > new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Faculty Schedules</h2>
        <p className="text-gray-600">View faculty availability and book consultation slots</p>
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

      {/* My Bookings Section */}
      {myBookings.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">My Upcoming Bookings</h3>
          <div className="space-y-3">
            {myBookings
              .filter(booking => new Date(booking.startTime) > new Date())
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
              .map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{booking.title}</h4>
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full text-white"
                          style={{ backgroundColor: scheduleTypes[booking.type]?.color }}
                        >
                          {scheduleTypes[booking.type]?.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        with {booking.faculty?.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(booking.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </span>
                        {booking.location && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {booking.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Faculty
          </label>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Faculty</option>
            {faculty.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name} {f.specialization && `- ${f.specialization}`}
              </option>
            ))}
          </select>
        </div>
      </div>

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
            editable={false}
            selectable={false}
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
                {eventInfo.event.extendedProps.isBooked && (
                  <div className="text-xs">✓ Booked</div>
                )}
              </div>
            )}
          />
        )}
      </div>

      {/* Event Details Modal */}
      {showDetailsModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
              onClick={() => setShowDetailsModal(false)}
            ></div>

            <div className="relative inline-block w-full max-w-2xl p-6 my-8 text-left bg-white rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 text-sm font-medium rounded-full text-white"
                      style={{ backgroundColor: scheduleTypes[selectedEvent.type]?.color }}
                    >
                      {scheduleTypes[selectedEvent.type]?.label}
                    </span>
                    {isBooked(selectedEvent._id) && (
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-600 text-white">
                        ✓ Booked
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Faculty Member</label>
                  <p className="text-lg text-gray-900">
                    {selectedEvent.faculty?.name}
                    {selectedEvent.faculty?.specialization && ` (${selectedEvent.faculty.specialization})`}
                  </p>
                </div>

                {selectedEvent.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{selectedEvent.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-gray-900">{formatDate(selectedEvent.startTime)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Time</label>
                    <p className="text-gray-900">{formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}</p>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-gray-900">{selectedEvent.location}</p>
                  </div>
                )}

                {selectedEvent.maxStudents && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Available Slots</label>
                    <p className="text-gray-900">
                      {selectedEvent.maxStudents - (selectedEvent.bookedStudents?.length || 0)} / {selectedEvent.maxStudents} remaining
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Close
                </button>
                {isBooked(selectedEvent._id) ? (
                  <button
                    onClick={() => {
                      handleCancelBooking(selectedEvent._id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
                  >
                    Cancel Booking
                  </button>
                ) : canBook(selectedEvent) ? (
                  <button
                    onClick={() => {
                      handleBook(selectedEvent._id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                  >
                    Book This Slot
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                  >
                    Not Available
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentScheduleView;
