import express from 'express';
import {
  getAllFaculty,
  getFacultyAvailability,
  createAvailability,
  updateAvailabilityStatus
} from '../controllers/facultyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllFaculty);
router.get('/:id/availability', getFacultyAvailability);

router.post(
  '/availability',
  protect,
  authorize('faculty', 'admin'),
  createAvailability
);

router.put(
  '/status',
  protect,
  authorize('faculty'),
  updateAvailabilityStatus
);

export default router;
