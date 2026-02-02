import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedAdminUser } from './utils/seedAdmin.js';

// Load environment variables
dotenv.config();

const runSeed = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Seed admin user
    await seedAdminUser();

    console.log('🎉 Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

runSeed();
