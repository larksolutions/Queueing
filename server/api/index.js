import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from '../routes/authRoutes.js';
import queueRoutes from '../routes/queueRoutes.js';
import facultyRoutes from '../routes/facultyRoutes.js';
import scheduleRoutes from '../routes/schedule.js';
import adminRoutes from '../routes/adminRoutes.js';

// Import utilities
import { seedAdminUser } from '../utils/seedAdmin.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB Connected');
    await seedAdminUser();
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'QR-Based Queueing and Faculty Availability System API',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to DB before handling request
export default async (req, res) => {
  await connectDB();
  return app(req, res);
};
