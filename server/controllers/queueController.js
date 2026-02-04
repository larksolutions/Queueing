import Queue from '../models/Queue.js';
import { generateQRCode } from '../utils/qrUtils.js';
import {
  sendQueueAssignmentEmail,
  sendQueueCompletionEmail,
  sendQueueRescheduledEmail,
  sendQueueDeclinedEmail
} from '../utils/emailService.js';

// @desc    Create new queue entry with automatic categorization
// @route   POST /api/queue
// @access  Private (Student)
export const createQueue = async (req, res, next) => {
  try {
    const { purpose, priority, concernCategory } = req.body;

    // Validate concern category
    const validCategories = ['ID', 'OJT', 'Capstone', 'Staff/Admin', 'Enrollment', 'Other'];
    if (!validCategories.includes(concernCategory)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid concern category'
      });
    }

    // Get the next queue number for today (overall)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastQueue = await Queue.findOne({
      checkInTime: { $gte: today }
    }).sort({ queueNumber: -1 });

    const queueNumber = lastQueue ? lastQueue.queueNumber + 1 : 1;

    // Calculate position in category queue
    const categoryQueueCount = await Queue.countDocuments({
      concernCategory,
      status: { $in: ['waiting', 'in-progress'] },
      checkInTime: { $gte: today }
    });

    const positionInQueue = categoryQueueCount + 1;

    // Estimate wait time based on category queue
    const avgServiceTime = 15; // minutes per person
    const estimatedWaitTime = categoryQueueCount * avgServiceTime;

    // Generate QR code data
    const qrData = {
      queueNumber,
      studentId: req.user._id,
      concernCategory,
      timestamp: Date.now()
    };

    const qrCode = await generateQRCode(qrData);

    const queue = await Queue.create({
      queueNumber,
      student: req.user._id,
      purpose,
      concernCategory,
      priority: priority || 'normal',
      qrCode,
      positionInQueue,
      estimatedWaitTime
    });

    await queue.populate('student', 'name email studentId');

    res.status(201).json({
      success: true,
      data: queue,
      message: `Queue #${queueNumber} created. Position in ${concernCategory} queue: ${positionInQueue}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all queue entries with category filtering
// @route   GET /api/queue
// @access  Private
export const getAllQueues = async (req, res, next) => {
  try {
    const { status, concernCategory } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (concernCategory) filter.concernCategory = concernCategory;
    
    // Security: If the logged-in user is faculty
    if (req.user.role === 'faculty') {
      // For 'waiting' status, show all queues (so faculty can see what needs to be assigned)
      if (status === 'waiting') {
        // Show all waiting queues - no faculty filter
      } else if (status && status !== 'waiting') {
        // For other statuses, show queues assigned to this faculty OR unassigned queues with that status
        filter.$or = [
          { faculty: req.user._id },
          { faculty: { $exists: false } },
          { faculty: null }
        ];
      } else if (!status) {
        // If no status filter, show waiting queues + queues assigned to this faculty + unassigned queues
        filter.$or = [
          { status: 'waiting' },
          { faculty: req.user._id },
          { faculty: { $exists: false } },
          { faculty: null }
        ];
      }
    }
    
    const queues = await Queue.find(filter)
      .populate('student', 'name email studentId')
      .populate('faculty', 'name email')
      .sort({ checkInTime: 1 });

    res.status(200).json({
      success: true,
      count: queues.length,
      data: queues
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get queue statistics by category
// @route   GET /api/queue/stats
// @access  Private
export const getQueueStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Queue.aggregate([
      {
        $match: {
          checkInTime: { $gte: today }
        }
      },
      {
        $group: {
          _id: '$concernCategory',
          total: { $sum: 1 },
          waiting: {
            $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's queue position
// @route   GET /api/queue/my-position/:id
// @access  Private
export const getQueuePosition = async (req, res, next) => {
  try {
    const queue = await Queue.findById(req.params.id)
      .populate('student', 'name email studentId');

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found'
      });
    }

    // Get current position in category queue
    const currentPosition = await Queue.countDocuments({
      concernCategory: queue.concernCategory,
      status: { $in: ['waiting', 'in-progress'] },
      checkInTime: { $lte: queue.checkInTime },
      _id: { $ne: queue._id }
    });

    res.status(200).json({
      success: true,
      data: {
        queue,
        currentPosition: currentPosition + 1,
        estimatedWaitTime: currentPosition * 15 // 15 min per person
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update queue status
// @route   PUT /api/queue/:id
// @access  Private (Faculty/Admin)
export const updateQueue = async (req, res, next) => {
  try {
    const { status, faculty, notes, remarks } = req.body;

    let queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found'
      });
    }

    // Admin restriction: cannot interfere with faculty queues
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot modify queue entries. Only faculty members can process queues.'
      });
    }

    const updateData = { status };
    
    // Auto-assign faculty when status changes to 'in-progress'
    if (status === 'in-progress' && req.user.role === 'faculty') {
      // Only auto-assign if not already assigned
      if (!queue.faculty && !faculty) {
        updateData.faculty = req.user._id;
        console.log('Auto-assigning faculty:', req.user._id, 'to queue:', queue._id);
      }
    }
    
    // Explicit faculty assignment overrides auto-assignment
    if (faculty) {
      updateData.faculty = faculty;
      console.log('Explicitly assigning faculty:', faculty, 'to queue:', queue._id);
    }
    
    if (notes) updateData.notes = notes;
    if (remarks) updateData.remarks = remarks;
    if (status === 'in-progress') {
      updateData.startTime = Date.now();
    }
    if (status === 'completed' || status === 'rescheduled' || status === 'declined') {
      updateData.completedTime = Date.now();
    }

    queue = await Queue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('student', 'name email studentId').populate('faculty', 'name email');

    // Send email notifications based on status
    const emailData = {
      queueNumber: queue.queueNumber,
      studentName: queue.student?.name || 'Student',
      category: queue.concernCategory,
      facultyName: queue.faculty?.name || 'Faculty',
      status: queue.status,
      remarks: queue.remarks || ''
    };

    if (queue.student?.email) {
      try {
        if (status === 'in-progress' && faculty) {
          await sendQueueAssignmentEmail(queue.student.email, emailData);
        } else if (status === 'completed') {
          await sendQueueCompletionEmail(queue.student.email, emailData);
        } else if (status === 'rescheduled') {
          await sendQueueRescheduledEmail(queue.student.email, emailData);
        } else if (status === 'declined') {
          await sendQueueDeclinedEmail(queue.student.email, emailData);
        }
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      success: true,
      data: queue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete queue entry
// @route   DELETE /api/queue/:id
// @access  Private
export const deleteQueue = async (req, res, next) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found'
      });
    }

    await queue.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
