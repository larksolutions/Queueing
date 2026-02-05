import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student'
  },
  studentId: {
    type: String,
    sparse: true
  },
  isEnrolled: {
    type: Boolean,
    default: false // For student enrollment status
  },
  facultyId: {
    type: String,
    sparse: true
  },
  department: {
    type: String,
    default: 'IT'
  },
  isAvailable: {
    type: Boolean,
    default: false // For faculty members
  },
  availabilityStatus: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline' // For faculty members
  },
  officeLocation: {
    type: String,
    default: ''
  },
  specialization: {
    type: String,
    default: ''
  },
  lastStatusUpdate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
