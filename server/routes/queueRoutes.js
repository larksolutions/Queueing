import express from 'express';
import {
  createQueue,
  getAllQueues,
  getQueueStats,
  getQueuePosition,
  updateQueue,
  deleteQueue
} from '../controllers/queueController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllQueues)
  .post(protect, authorize('student', 'admin'), createQueue);

router.get('/stats', protect, getQueueStats);
router.get('/my-position/:id', protect, getQueuePosition);

router.route('/:id')
  .put(protect, updateQueue)
  .delete(protect, deleteQueue);

export default router;
