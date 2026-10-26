import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import ContactRequest from '../models/ContactRequest.js';
import Notification from '../models/Notification.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const seedDatabase = async () => {
  // Requirement: Never insert fake records automatically into a real production database
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ SAFETY REFUSAL: Seeding dummy data is strictly forbidden in production mode.');
    process.exit(1);
  }

  console.log('🩸 Initializing BloodLink development seed data...');
  await connectDB();

  try {
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('DemoPass123!', salt);

    // Fictitious Users & Donors
    const demoUsersData = [
      {
        name: 'Aarav Sharma',
        email: 'aarav.donor@example.com',
        passwordHash: demoPasswordHash,
        phone: '9820011223',
        address: { city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400050' },
        role: 'user',
        status: 'active',
        donorProfile: {
          isDonor: true,
          bloodGroup: 'O+',
          available: true,
          verificationStatus: 'verified',
          lastDonationDate: new Date('2026-05-10'),
          bio: 'Regular blood donor since college. Happy to help in emergencies.',
        },
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        passwordHash: demoPasswordHash,
        phone: '9833344556',
        address: { city: 'Pune', district: 'Pune', state: 'Maharashtra', pincode: '411001' },
        role: 'user',
        status: 'active',
        donorProfile: {
          isDonor: true,
          bloodGroup: 'A+',
          available: true,
          verificationStatus: 'verified',
          lastDonationDate: new Date('2026-07-20'),
          bio: 'Universal red blood cell platelet donor. Available weekends and evenings.',
        },
      },
      {
        name: 'Rohan Verma',
        email: 'rohan.verma@example.com',
        passwordHash: demoPasswordHash,
        phone: '9844455667',
        address: { city: 'Delhi', district: 'New Delhi', state: 'Delhi', pincode: '110001' },
        role: 'user',
        status: 'active',
        donorProfile: {
          isDonor: true,
          bloodGroup: 'B+',
          available: true,
          verificationStatus: 'verified',
          lastDonationDate: new Date('2026-06-15'),
          bio: 'Committed community volunteer ready for emergency calls.',
        },
      },
      {
        name: 'Ananya Rao',
        email: 'ananya.rao@example.com',
        passwordHash: demoPasswordHash,
        phone: '9855566778',
        address: { city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560001' },
        role: 'user',
        status: 'active',
        donorProfile: {
          isDonor: true,
          bloodGroup: 'AB+',
          available: true,
          verificationStatus: 'pending', // Pending verification demo
          lastDonationDate: null,
          bio: 'First time donor, recently completed registration.',
        },
      },
      {
        name: 'Karan Mehra',
        email: 'karan.mehra@example.com',
        passwordHash: demoPasswordHash,
        phone: '9866677889',
        address: { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
        role: 'user',
        status: 'active',
        donorProfile: {
          isDonor: true,
          bloodGroup: 'O-', // Rare universal donor
          available: true,
          verificationStatus: 'verified',
          lastDonationDate: new Date('2026-04-10'),
          bio: 'O-Negative universal donor. Ready to assist critical ICU requests.',
        },
      },
      {
        name: 'Sunita Roy',
        email: 'sunita.roy@example.com',
        passwordHash: demoPasswordHash,
        phone: '9877788990',
        address: { city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', pincode: '700001' },
        role: 'user',
        status: 'active',
        donorProfile: {
          isDonor: false, // Standard requester account
          available: false,
          verificationStatus: 'pending',
        },
      },
      {
        name: 'BloodLink Administrator',
        email: 'admin@bloodlink.org',
        passwordHash: demoPasswordHash,
        phone: '9811122233',
        address: { city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', pincode: '400001' },
        role: 'admin',
        status: 'active',
        donorProfile: {
          isDonor: false,
          available: false,
          verificationStatus: 'verified',
        },
      },
    ];

    console.log('Seeding demo users...');
    const createdUsers = [];
    for (const uData of demoUsersData) {
      let user = await User.findOne({ email: uData.email });
      if (!user) {
        user = await User.create(uData);
      }
      createdUsers.push(user);
    }

    const requester = createdUsers.find((u) => u.email === 'sunita.roy@example.com');
    const priya = createdUsers.find((u) => u.email === 'priya.patel@example.com');
    const aarav = createdUsers.find((u) => u.email === 'aarav.donor@example.com');

    // Fictitious Blood Requests
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const demoRequests = [
      {
        createdBy: requester._id,
        bloodGroup: 'O+',
        unitsRequired: 3,
        hospitalName: 'Lilavati Hospital & Research Centre',
        city: 'Mumbai',
        district: 'Mumbai Suburban',
        state: 'Maharashtra',
        requiredBy: tomorrow,
        urgency: 'critical',
        description: 'Urgent requirement for cardiac surgery patient in ICU. Immediate donation needed.',
        contactPhone: requester.phone,
        status: 'open',
      },
      {
        createdBy: requester._id,
        bloodGroup: 'A+',
        unitsRequired: 2,
        hospitalName: 'Ruby Hall Clinic',
        city: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        requiredBy: inThreeDays,
        urgency: 'urgent',
        description: 'Scheduled orthopedic surgery requires replacement blood units.',
        contactPhone: requester.phone,
        status: 'open',
      },
      {
        createdBy: priya._id,
        bloodGroup: 'O-',
        unitsRequired: 1,
        hospitalName: 'Apollo Hospital',
        city: 'Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
        requiredBy: tomorrow,
        urgency: 'critical',
        description: 'Emergency trauma resuscitation requires O-Negative blood units.',
        contactPhone: priya.phone,
        status: 'open',
      },
    ];

    console.log('Seeding demo blood requests...');
    const createdRequests = [];
    for (const rData of demoRequests) {
      const existing = await BloodRequest.findOne({
        hospitalName: rData.hospitalName,
        bloodGroup: rData.bloodGroup,
        city: rData.city,
      });
      if (!existing) {
        const reqDoc = await BloodRequest.create(rData);
        createdRequests.push(reqDoc);
      } else {
        createdRequests.push(existing);
      }
    }

    // Fictitious Contact Request (Offer to donate from Aarav to Sunita's Mumbai request)
    if (createdRequests[0] && aarav && requester) {
      const existingContact = await ContactRequest.findOne({
        sender: aarav._id,
        recipient: requester._id,
        bloodRequest: createdRequests[0]._id,
      });

      if (!existingContact) {
        console.log('Seeding sample contact offer...');
        const contact = await ContactRequest.create({
          sender: aarav._id,
          recipient: requester._id,
          bloodRequest: createdRequests[0]._id,
          message: 'Hello Sunita, I am a verified O+ donor in Mumbai. I am available to donate tomorrow morning at Lilavati Hospital.',
          status: 'pending',
        });

        await Notification.create({
          user: requester._id,
          title: 'New Donation Offer for O+ Blood Request',
          message: `${aarav.name} offered to help with your request at Lilavati Hospital & Research Centre.`,
          type: 'contact_request_received',
          relatedEntityId: contact._id,
          relatedEntityType: 'ContactRequest',
        });
      }
    }

    console.log('✅ Demo seed data created successfully!');
    console.log('Demo Credentials for Testing:');
    console.log('  Admin:     admin@bloodlink.org  /  DemoPass123!');
    console.log('  Donor:     aarav.donor@example.com  /  DemoPass123! (O+ Verified)');
    console.log('  Donor:     priya.patel@example.com  /  DemoPass123! (A+ Verified)');
    console.log('  Requester: sunita.roy@example.com  /  DemoPass123!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seedDatabase();
