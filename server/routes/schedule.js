import express from 'express';
import * as scheduleController from '../controllers/scheduleController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all public schedules (for students)
router.get('/public', protect, scheduleController.getAllPublicSchedules);

// Get faculty schedules
router.get('/faculty/:facultyId', protect, scheduleController.getFacultySchedules);

// Get my booked schedules (for students)
router.get('/my-bookings', protect, scheduleController.getMyBookedSchedules);

// Create schedule (faculty only)
router.post('/', protect, scheduleController.createSchedule);

// Update schedule (faculty only)
router.put('/:scheduleId', protect, scheduleController.updateSchedule);

// Delete schedule (faculty only)
router.delete('/:scheduleId', protect, scheduleController.deleteSchedule);

// Book a schedule (students only)
router.post('/:scheduleId/book', protect, scheduleController.bookSchedule);

// Cancel booking (students only)
router.post('/:scheduleId/cancel', protect, scheduleController.cancelBooking);

export default router;
