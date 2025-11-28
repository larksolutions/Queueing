import FacultyAvailability from '../models/FacultyAvailability.js';
import User from '../models/User.js';

// @desc    Get all faculty members
// @route   GET /api/faculty
// @access  Public
export const getAllFaculty = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    
    let query = { role: 'faculty' };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { facultyId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status) {
      query.availabilityStatus = status;
    }

    const faculty = await User.find(query).select('-password');

    res.status(200).json({
      success: true,
      count: faculty.length,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get faculty availability
// @route   GET /api/faculty/:id/availability
// @access  Public
export const getFacultyAvailability = async (req, res, next) => {
  try {
    const availability = await FacultyAvailability.find({
      faculty: req.params.id
    }).populate('faculty', 'name email');

    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create faculty availability
// @route   POST /api/faculty/availability
// @access  Private (Faculty)
export const createAvailability = async (req, res, next) => {
  try {
    const { dayOfWeek, startTime, endTime, location } = req.body;

    const availability = await FacultyAvailability.create({
      faculty: req.user._id,
      dayOfWeek,
      startTime,
      endTime,
      location
    });

    res.status(201).json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update faculty availability status
// @route   PUT /api/faculty/status
// @access  Private (Faculty)
export const updateAvailabilityStatus = async (req, res, next) => {
  try {
    const { isAvailable, availabilityStatus } = req.body;

    const updateData = {
      lastStatusUpdate: Date.now()
    };

    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable;
    }

    if (availabilityStatus) {
      updateData.availabilityStatus = availabilityStatus;
      // Sync isAvailable with availabilityStatus
      updateData.isAvailable = availabilityStatus === 'available';
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
