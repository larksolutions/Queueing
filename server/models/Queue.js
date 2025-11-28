import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  queueNumber: {
    type: Number,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  concernCategory: {
    type: String,
    enum: ['ID', 'OJT', 'Capstone', 'Staff/Admin', 'Enrollment', 'Other'],
    required: [true, 'Please select a concern category'],
    index: true
  },
  purpose: {
    type: String,
    required: [true, 'Please provide the purpose of visit'],
    trim: true
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'cancelled'],
    default: 'waiting',
    index: true
  },
  qrCode: {
    type: String // Base64 QR code image
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
  },
  estimatedWaitTime: {
    type: Number, // in minutes
    default: 0
  },
  positionInQueue: {
    type: Number // Position in category queue
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  startTime: {
    type: Date
  },
  completedTime: {
    type: Date
  },
  notes: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
queueSchema.index({ status: 1, checkInTime: 1 });
queueSchema.index({ concernCategory: 1, status: 1 });
queueSchema.index({ student: 1 });
queueSchema.index({ faculty: 1 });

const Queue = mongoose.model('Queue', queueSchema);

export default Queue;
