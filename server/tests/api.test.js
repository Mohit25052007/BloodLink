import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import ContactRequest from '../models/ContactRequest.js';
import Notification from '../models/Notification.js';
import bcrypt from 'bcryptjs';

describe('BloodLink API Test Suite', () => {
  // 1. Health check test
  describe('Health Check Endpoint', () => {
    it('GET /api/health should return status ok and service information', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('BloodLink REST API');
      expect(res.body.database).toBe('connected');
    });
  });

  // 2. Authentication & User Registration tests
  describe('Authentication & Registration Flow', () => {
    const validUserPayload = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123',
      phone: '9876543210',
      address: {
        city: 'Mumbai',
        district: 'Mumbai City',
        state: 'Maharashtra',
        pincode: '400001',
      },
      isDonor: true,
      bloodGroup: 'O+',
      bio: 'Ready to help save lives',
    };

    it('POST /api/auth/register should register a user, hash password, and set HTTP-only cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUserPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('john.doe@example.com');
      expect(res.body.user.role).toBe('user');
      expect(res.body.user.passwordHash).toBeUndefined(); // Never expose password hash

      // Verify HTTP-only cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);

      // Verify database stored hashed password
      const dbUser = await User.findOne({ email: 'john.doe@example.com' }).select('+passwordHash');
      expect(dbUser).toBeDefined();
      expect(dbUser.passwordHash).not.toBe(validUserPayload.password);
      const isMatch = await bcrypt.compare(validUserPayload.password, dbUser.passwordHash);
      expect(isMatch).toBe(true);
    });

    it('POST /api/auth/register should reject duplicate email', async () => {
      await request(app).post('/api/auth/register').send(validUserPayload);

      const res = await request(app).post('/api/auth/register').send(validUserPayload);
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('POST /api/auth/register should strictly forbid public assignment of admin role', async () => {
      const payloadWithAdmin = {
        ...validUserPayload,
        email: 'hacker@example.com',
        role: 'admin',
      };

      const res = await request(app).post('/api/auth/register').send(payloadWithAdmin);
      expect(res.status).toBe(400);
      expect(res.body.errors[0].message).toMatch(/cannot assign the administrator role/i);
    });

    it('POST /api/auth/login should authenticate valid credentials and reject invalid credentials', async () => {
      await request(app).post('/api/auth/register').send(validUserPayload);

      // Successful login
      const validLogin = await request(app).post('/api/auth/login').send({
        email: 'john.doe@example.com',
        password: 'SecurePassword123',
      });
      expect(validLogin.status).toBe(200);
      expect(validLogin.body.user.name).toBe('John Doe');

      // Invalid password
      const invalidLogin = await request(app).post('/api/auth/login').send({
        email: 'john.doe@example.com',
        password: 'WrongPassword999',
      });
      expect(invalidLogin.status).toBe(401);
      expect(invalidLogin.body.success).toBe(false);
    });
  });

  // 3. Donor Discovery and Privacy Protection
  describe('Donor Discovery and Privacy Controls', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('Pass1234!', salt);

      // Verified donor
      await User.create({
        name: 'Verified Donor Mumbai',
        email: 'v.donor@example.com',
        passwordHash: hash,
        phone: '9991112222',
        address: { city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        donorProfile: { isDonor: true, bloodGroup: 'B+', available: true, verificationStatus: 'verified' },
      });

      // Pending donor
      await User.create({
        name: 'Pending Donor Mumbai',
        email: 'p.donor@example.com',
        passwordHash: hash,
        phone: '9993334444',
        address: { city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        donorProfile: { isDonor: true, bloodGroup: 'B+', available: true, verificationStatus: 'pending' },
      });

      // Unavailable donor
      await User.create({
        name: 'Unavailable Donor',
        email: 'u.donor@example.com',
        passwordHash: hash,
        phone: '9995556666',
        address: { city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        donorProfile: { isDonor: true, bloodGroup: 'B+', available: false, verificationStatus: 'verified' },
      });
    });

    it('GET /api/users/donors should return ONLY verified and available donors by default', async () => {
      const res = await request(app).get('/api/users/donors?bloodGroup=B+&city=Mumbai');
      expect(res.status).toBe(200);
      expect(res.body.donors.length).toBe(1);
      expect(res.body.donors[0].name).toBe('Verified Donor Mumbai');

      // CRITICAL PRIVACY VERIFICATION: Phone and email MUST NOT be exposed!
      expect(res.body.donors[0].phone).toBeUndefined();
      expect(res.body.donors[0].email).toBeUndefined();
    });
  });

  // 4. Blood Request Management & Ownership
  describe('Blood Request Lifecycle & Ownership', () => {
    let requesterToken;
    let otherUserToken;
    let requesterId;

    beforeEach(async () => {
      const res1 = await request(app).post('/api/auth/register').send({
        name: 'Requester Alice',
        email: 'alice@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        phone: '9111111111',
        address: { city: 'Delhi', district: 'Delhi', state: 'Delhi', pincode: '110001' },
      });
      requesterToken = res1.body.token;
      requesterId = res1.body.user._id;

      const res2 = await request(app).post('/api/auth/register').send({
        name: 'Bob Other',
        email: 'bob@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        phone: '9222222222',
        address: { city: 'Delhi', district: 'Delhi', state: 'Delhi', pincode: '110001' },
      });
      otherUserToken = res2.body.token;
    });

    it('should create a blood request and enforce creator ownership on edits', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const createRes = await request(app)
        .post('/api/blood-requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({
          bloodGroup: 'A+',
          unitsRequired: 2,
          hospitalName: 'AIIMS New Delhi',
          city: 'Delhi',
          district: 'Delhi',
          state: 'Delhi',
          requiredBy: tomorrow,
          urgency: 'critical',
          description: 'Emergency ICU blood transfusion',
        });

      expect(createRes.status).toBe(201);
      const requestId = createRes.body.request._id;

      // Other user attempts to update -> Should be rejected (403)
      const unauthorizedUpdate = await request(app)
        .patch(`/api/blood-requests/${requestId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ unitsRequired: 5 });

      expect(unauthorizedUpdate.status).toBe(403);

      // Owner updates -> Should succeed (200)
      const authorizedUpdate = await request(app)
        .patch(`/api/blood-requests/${requestId}`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ unitsRequired: 3 });

      expect(authorizedUpdate.status).toBe(200);
      expect(authorizedUpdate.body.request.unitsRequired).toBe(3);
    });
  });

  // 5. Contact Requests & Contact Privacy Workflow
  describe('Contact Request Workflow and Contact Info Privacy', () => {
    let requesterUser, donorUser;
    let requesterToken, donorToken;
    let bloodRequest;

    beforeEach(async () => {
      const res1 = await request(app).post('/api/auth/register').send({
        name: 'Requester Sarah',
        email: 'sarah@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        phone: '9888877777',
        address: { city: 'Pune', district: 'Pune', state: 'Maharashtra', pincode: '411001' },
      });
      requesterUser = res1.body.user;
      requesterToken = res1.body.token;

      const res2 = await request(app).post('/api/auth/register').send({
        name: 'Donor David',
        email: 'david@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        phone: '9999988888',
        address: { city: 'Pune', district: 'Pune', state: 'Maharashtra', pincode: '411001' },
        isDonor: true,
        bloodGroup: 'O+',
      });
      donorUser = res2.body.user;
      donorToken = res2.body.token;

      const reqRes = await request(app)
        .post('/api/blood-requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({
          bloodGroup: 'O+',
          unitsRequired: 1,
          hospitalName: 'Ruby Hall Clinic',
          city: 'Pune',
          district: 'Pune',
          state: 'Maharashtra',
          requiredBy: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          urgency: 'urgent',
        });
      bloodRequest = reqRes.body.request;
    });

    it('should handle contact offer, prevent self-contact, hide phone while pending, and reveal upon acceptance', async () => {
      // 1. Prevent self-contact
      const selfContact = await request(app)
        .post('/api/contact-requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({
          recipient: requesterUser._id,
          message: 'Trying to contact myself',
        });
      expect(selfContact.status).toBe(400);

      // 2. Donor sends offer to requester
      const offerRes = await request(app)
        .post('/api/contact-requests')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          recipient: requesterUser._id,
          bloodRequest: bloodRequest._id,
          message: 'I am an O+ donor in Pune and can arrive tomorrow morning.',
        });
      expect(offerRes.status).toBe(201);
      const contactRequestId = offerRes.body.contactRequest._id;

      // 3. Prevent duplicate pending requests
      const dupRes = await request(app)
        .post('/api/contact-requests')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          recipient: requesterUser._id,
          bloodRequest: bloodRequest._id,
          message: 'Sending duplicate message',
        });
      expect(dupRes.status).toBe(409);

      // 4. Requester views incoming requests -> status is 'pending', phone MUST BE HIDDEN
      const incomingPending = await request(app)
        .get('/api/contact-requests/incoming')
        .set('Authorization', `Bearer ${requesterToken}`);
      expect(incomingPending.status).toBe(200);
      expect(incomingPending.body.requests[0].sender.phone).toBeUndefined();

      // 5. Requester accepts the contact request
      const acceptRes = await request(app)
        .patch(`/api/contact-requests/${contactRequestId}/respond`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ action: 'accept' });
      expect(acceptRes.status).toBe(200);

      // 6. Requester views incoming requests again -> now accepted, phone IS REVEALED
      const incomingAccepted = await request(app)
        .get('/api/contact-requests/incoming')
        .set('Authorization', `Bearer ${requesterToken}`);
      expect(incomingAccepted.body.requests[0].sender.phone).toBe('9999988888');

      // 7. Donor checks notifications -> should have received acceptance notification
      const donorNotifications = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${donorToken}`);
      expect(donorNotifications.body.notifications.length).toBeGreaterThan(0);
      expect(donorNotifications.body.notifications[0].type).toBe('contact_request_accepted');
    });
  });

  // 6. Admin Privileges and Moderation
  describe('Admin Role Protection & Moderation', () => {
    let userToken;
    let adminToken;
    let donorId;

    beforeEach(async () => {
      // Normal user
      const userRes = await request(app).post('/api/auth/register').send({
        name: 'Regular User',
        email: 'regular@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        phone: '9555544444',
        address: { city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        isDonor: true,
        bloodGroup: 'AB-',
      });
      userToken = userRes.body.token;
      donorId = userRes.body.user._id;

      // Admin user
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('AdminSecret123!', salt);
      const adminDoc = await User.create({
        name: 'Admin Boss',
        email: 'admin.boss@example.com',
        passwordHash: hash,
        phone: '9111122222',
        address: { city: 'HQ', district: 'HQ', state: 'HQ', pincode: '100001' },
        role: 'admin',
      });

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'admin.boss@example.com',
        password: 'AdminSecret123!',
      });
      adminToken = loginRes.body.token;
    });

    it('should deny non-admin users from admin dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow admin to access dashboard and approve donor verification', async () => {
      const statsRes = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(statsRes.status).toBe(200);
      expect(statsRes.body.stats.totalUsers).toBeGreaterThan(0);

      // Approve donor verification
      const verifyRes = await request(app)
        .patch(`/api/admin/users/${donorId}/verification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'verified', notes: 'Identity proof validated' });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.donorProfile.verificationStatus).toBe('verified');

      // Check that notification was sent to user
      const notifs = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`);
      expect(notifs.body.notifications[0].type).toBe('donor_verification_update');
    });
  });
});
