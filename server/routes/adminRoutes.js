import express from 'express';
import {
  getAllStudents,
  getAllFacultyAdmin,
  getStudentById,
  getFacultyById,
  getSystemAnalytics,
  updateUser,
  deleteUser
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student management routes
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentById);

// Faculty management routes (read-only for admin)
router.get('/faculty', getAllFacultyAdmin);
router.get('/faculty/:id', getFacultyById);

// User management routes
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Analytics route
router.get('/analytics', getSystemAnalytics);

export default router;
