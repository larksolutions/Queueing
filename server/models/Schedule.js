import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['available', 'busy', 'consultation', 'class', 'meeting', 'office-hours', 'break'],
    default: 'available'
  },
  location: {
    type: String,
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
    },
    daysOfWeek: [{
      type: Number, // 0 = Sunday, 1 = Monday, etc.
      min: 0,
      max: 6
    }],
    endDate: Date
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  maxStudents: {
    type: Number,
    default: null
  },
  bookedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for efficient querying
scheduleSchema.index({ faculty: 1, startTime: 1 });
scheduleSchema.index({ startTime: 1, endTime: 1 });

// Virtual for checking if schedule is full
scheduleSchema.virtual('isFull').get(function() {
  if (!this.maxStudents) return false;
  return this.bookedStudents.length >= this.maxStudents;
});

// Method to check if time slot overlaps with existing schedule
scheduleSchema.methods.hasOverlap = async function(facultyId, startTime, endTime, excludeId = null) {
  const query = {
    faculty: facultyId,
    _id: { $ne: excludeId },
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
    ]
  };
  
  const overlapping = await this.constructor.findOne(query);
  return !!overlapping;
};

export default mongoose.model('Schedule', scheduleSchema);
