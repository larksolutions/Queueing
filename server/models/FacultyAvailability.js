import mongoose from 'mongoose';

const facultyAvailabilitySchema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String, // Format: "HH:MM" (24-hour)
    required: true
  },
  endTime: {
    type: String, // Format: "HH:MM" (24-hour)
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    default: 'IT Department Office'
  }
}, {
  timestamps: true
});

// Compound index for unique faculty schedule per day
facultyAvailabilitySchema.index({ faculty: 1, dayOfWeek: 1 });

const FacultyAvailability = mongoose.model('FacultyAvailability', facultyAvailabilitySchema);

export default FacultyAvailability;
