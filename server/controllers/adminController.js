import User from '../models/User.js';

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin only)
export const getAllStudents = async (req, res, next) => {
  try {
    const { search, enrolled, page = 1, limit = 20 } = req.query;
    
    // Admin-only access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    let query = { role: 'student' };
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all faculty members (Admin view)
// @route   GET /api/admin/faculty
// @access  Private (Admin only)
export const getAllFacultyAdmin = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    
    // Admin-only access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    let query = { role: 'faculty' };
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { facultyId: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status) {
      query.availabilityStatus = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    const faculty = await User.find(query)
      .select('-password')
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: faculty.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student details
// @route   GET /api/admin/students/:id
// @access  Private (Admin only)
export const getStudentById = async (req, res, next) => {
  try {
    // Admin-only access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const student = await User.findById(req.params.id).select('-password');

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get faculty details
// @route   GET /api/admin/faculty/:id
// @access  Private (Admin only)
export const getFacultyById = async (req, res, next) => {
  try {
    // Admin-only access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const faculty = await User.findById(req.params.id).select('-password');

    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
export const getSystemAnalytics = async (req, res, next) => {
  try {
    // Admin-only access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no date range provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0); // Set to start of day
    
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999); // Set to end of day

    console.log('📅 Analytics date range:', { start, end, startDate, endDate });

    // Import Queue model dynamically
    const Queue = (await import('../models/Queue.js')).default;

    // Get queue trends over time
    const queueTrends = await Queue.aggregate([
      {
        $match: {
          checkInTime: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$checkInTime' } }
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          rescheduled: {
            $sum: { $cond: [{ $eq: ['$status', 'rescheduled'] }, 1, 0] }
          },
          declined: {
            $sum: { $cond: [{ $eq: ['$status', 'declined'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Get user growth stats
    const studentCount = await User.countDocuments({ role: 'student' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const totalUsers = await User.countDocuments();

    console.log('📊 Analytics results:', {
      queueTrendsCount: queueTrends.length,
      queueTrends: queueTrends,
      studentCount,
      facultyCount
    });

    res.status(200).json({
      success: true,
      data: {
        queueTrends,
        userStats: {
          students: studentCount,
          faculty: facultyCount,
          total: totalUsers
        },
        dateRange: {
          start,
          end
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (student or faculty)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res, next) => {
  try {
    // Admin-only access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating password through this endpoint
    delete updateData.password;

    // Don't allow updating role to admin
    if (updateData.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change user role to admin through this endpoint.'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (student or faculty)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    // Admin-only access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users.'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account.'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: `User ${user.name} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllStudents,
  getAllFacultyAdmin,
  getStudentById,
  getFacultyById,
  getSystemAnalytics,
  updateUser,
  deleteUser
};
