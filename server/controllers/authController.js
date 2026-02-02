import User from '../models/User.js';
import { generateToken } from '../utils/tokenUtils.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, studentId, facultyId } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      studentId,
      facultyId
    });

    // Generate token
    const token = generateToken(user._id);

    // Prepare user response (exclude password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      facultyId: user.facultyId,
      specialization: user.specialization,
      officeLocation: user.officeLocation,
      department: user.department,
      isAvailable: user.isAvailable,
      availabilityStatus: user.availabilityStatus,
      lastStatusUpdate: user.lastStatusUpdate
    };

    res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Prepare user response (exclude password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      facultyId: user.facultyId,
      specialization: user.specialization,
      officeLocation: user.officeLocation,
      department: user.department,
      isAvailable: user.isAvailable,
      availabilityStatus: user.availabilityStatus,
      lastStatusUpdate: user.lastStatusUpdate
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res, next) => {
  try {
    console.log('🔵 Admin login attempt started');
    const { email, password } = req.body;
    console.log('📧 Email:', email);
    console.log('🔑 Password provided:', !!password);

    // Validate email & password
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user with admin role
    console.log('🔍 Searching for admin user...');
    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    console.log('👤 User found:', !!user);
    if (user) {
      console.log('📋 User details:', { id: user._id, email: user.email, role: user.role });
    }

    if (!user) {
      console.log('❌ No admin user found with email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if password matches
    console.log('🔐 Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    console.log('🔐 Password match:', isMatch);

    if (!isMatch) {
      console.log('❌ Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Prepare admin response
    const adminResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    console.log('✅ Admin login successful:', user.email);

    res.status(200).json({
      success: true,
      token,
      user: adminResponse
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
