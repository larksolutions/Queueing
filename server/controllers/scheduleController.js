import Schedule from '../models/Schedule.js';
import User from '../models/User.js';

// Get all schedules for a faculty member
export const getFacultySchedules = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { startDate, endDate, type } = req.query;

    // Security: If the logged-in user is faculty, only allow viewing their own schedules
    if (req.user.role === 'faculty' && req.user._id.toString() !== facultyId) {
      return res.status(403).json({ message: 'Access denied. Faculty can only view their own schedules.' });
    }

    const query = { faculty: facultyId };

    // Filter by date range if provided
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    const schedules = await Schedule.find(query)
      .populate('faculty', 'name email facultyId specialization officeLocation')
      .populate('bookedStudents', 'name email studentId')
      .sort({ startTime: 1 });

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching faculty schedules:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all public schedules (for students)
export const getAllPublicSchedules = async (req, res) => {
  try {
    const { startDate, endDate, facultyId } = req.query;

    const query = { isPublic: true };

    if (facultyId) {
      query.faculty = facultyId;
    }

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const schedules = await Schedule.find(query)
      .populate('faculty', 'name email facultyId specialization officeLocation')
      .sort({ startTime: 1 });

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching public schedules:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new schedule
export const createSchedule = async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      type,
      location,
      isRecurring,
      recurrencePattern,
      color,
      isPublic,
      maxStudents
    } = req.body;

    // Validate faculty user - only faculty can create schedules
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Only faculty members can create schedules' });
    }

    // Validate time
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Check for overlapping schedules
    const schedule = new Schedule();
    const hasOverlap = await schedule.hasOverlap(req.user._id, start, end);
    
    if (hasOverlap) {
      return res.status(400).json({ message: 'This time slot overlaps with an existing schedule' });
    }

    const newSchedule = new Schedule({
      faculty: req.user._id,
      title,
      description,
      startTime: start,
      endTime: end,
      type: type || 'available',
      location: location || req.user.officeLocation,
      isRecurring: isRecurring || false,
      recurrencePattern,
      color: color || '#3B82F6',
      isPublic: isPublic !== undefined ? isPublic : true,
      maxStudents
    });

    await newSchedule.save();
    await newSchedule.populate('faculty', 'name email facultyId specialization officeLocation');

    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a schedule
export const updateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const updates = req.body;

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if user owns this schedule - admins cannot modify
    if (schedule.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this schedule. Only the owning faculty member can update their schedules.' });
    }

    // If updating time, check for overlaps
    if (updates.startTime || updates.endTime) {
      const start = new Date(updates.startTime || schedule.startTime);
      const end = new Date(updates.endTime || schedule.endTime);
      
      if (start >= end) {
        return res.status(400).json({ message: 'End time must be after start time' });
      }

      const hasOverlap = await schedule.hasOverlap(schedule.faculty, start, end, scheduleId);
      
      if (hasOverlap) {
        return res.status(400).json({ message: 'This time slot overlaps with an existing schedule' });
      }
    }

    Object.keys(updates).forEach(key => {
      schedule[key] = updates[key];
    });

    await schedule.save();
    await schedule.populate('faculty', 'name email facultyId specialization officeLocation');

    res.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if user owns this schedule - admins cannot delete
    if (schedule.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this schedule. Only the owning faculty member can delete their schedules.' });
    }

    await Schedule.findByIdAndDelete(scheduleId);

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Book a time slot (for students)
export const bookSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can book schedules' });
    }

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (!schedule.isPublic) {
      return res.status(403).json({ message: 'This schedule is not available for booking' });
    }

    if (schedule.type !== 'consultation' && schedule.type !== 'office-hours' && schedule.type !== 'available') {
      return res.status(400).json({ message: 'This schedule type cannot be booked' });
    }

    // Check if already booked
    if (schedule.bookedStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already booked this time slot' });
    }

    // Check if full
    if (schedule.maxStudents && schedule.bookedStudents.length >= schedule.maxStudents) {
      return res.status(400).json({ message: 'This time slot is fully booked' });
    }

    schedule.bookedStudents.push(req.user._id);
    await schedule.save();
    await schedule.populate('faculty', 'name email facultyId specialization officeLocation');
    await schedule.populate('bookedStudents', 'name email studentId');

    res.json(schedule);
  } catch (error) {
    console.error('Error booking schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel booking (for students)
export const cancelBooking = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Remove student from booked list
    schedule.bookedStudents = schedule.bookedStudents.filter(
      studentId => studentId.toString() !== req.user._id.toString()
    );

    await schedule.save();
    await schedule.populate('faculty', 'name email facultyId specialization officeLocation');

    res.json(schedule);
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my booked schedules (for students)
export const getMyBookedSchedules = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view booked schedules' });
    }

    const schedules = await Schedule.find({
      bookedStudents: req.user._id
    })
      .populate('faculty', 'name email facultyId specialization officeLocation')
      .sort({ startTime: 1 });

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching booked schedules:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
