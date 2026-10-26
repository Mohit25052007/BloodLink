import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const createAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'System Administrator';
  const adminPhone = process.env.ADMIN_PHONE || '9876543210';

  console.log('--- BloodLink Administrator Account Initialization ---');

  // Requirement: Refuse to run if required credentials are missing
  if (!adminEmail || !adminPassword) {
    console.error('❌ ERROR: Missing required environment variables.');
    console.error('Please configure ADMIN_EMAIL and ADMIN_PASSWORD in your environment or .env file before running this script.');
    process.exit(1);
  }

  // Password strength check
  if (adminPassword.length < 8) {
    console.error('❌ ERROR: ADMIN_PASSWORD must be at least 8 characters long for security compliance.');
    process.exit(1);
  }

  await connectDB();

  try {
    const normalizedEmail = adminEmail.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    if (existingUser) {
      existingUser.role = 'admin';
      existingUser.status = 'active';
      existingUser.passwordHash = passwordHash;
      await existingUser.save();
      console.log(`✅ SUCCESS: Existing user [${normalizedEmail}] has been elevated to Administrator role and password updated.`);
    } else {
      const newAdmin = new User({
        name: adminName,
        email: normalizedEmail,
        passwordHash,
        phone: adminPhone,
        address: {
          city: 'Central Office',
          district: 'Metro',
          state: 'State HQ',
          pincode: '400001',
        },
        role: 'admin',
        status: 'active',
        donorProfile: {
          isDonor: false,
          available: false,
          verificationStatus: 'verified',
        },
      });

      await newAdmin.save();
      console.log(`✅ SUCCESS: New Administrator account created successfully: [${normalizedEmail}]`);
    }

    console.log('You can now log in at http://localhost:5173/login with your administrator credentials.');
  } catch (error) {
    console.error('❌ Failed to create administrator:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

createAdmin();
