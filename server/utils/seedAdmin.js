import User from '../models/User.js';

export const seedAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'queuing@neu.edu.ph' });
    
    if (existingAdmin) {
      console.log('ℹ️  Default admin user already exists');
      return;
    }

    // Create default admin user
    // Don't manually hash - User model will handle it with pre-save hook
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'queuing@neu.edu.ph',
      password: 'queuingadmin@123', // Plain password - will be hashed by model
      role: 'admin',
      isAvailable: false,
      availabilityStatus: 'offline'
    });

    console.log('✅ Default admin user created successfully');
    console.log('📧 Email: queuing@neu.edu.ph');
    console.log('🔑 Password: queuingadmin@123');
    console.log('⚠️  Please change the default password after first login');
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
  }
};
